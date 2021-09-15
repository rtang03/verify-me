import util from 'util';
import type {
  IDIDManagerGetOrCreateArgs,
  IIdentifier,
  IKey,
  IKeyManagerGetArgs,
} from '@veramo/core';
import { Entities } from '@veramo/data-store';
import Debug from 'debug';
import includes from 'lodash/includes';
import { Provider } from 'oidc-provider';
import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import {
  Tenant,
  OidcCredential,
  OidcClient,
  OidcIssuer,
  OidcFederatedProvider,
  OidcVerifier,
  OidcPayload,
} from '../entities';
import type { TenantManager, TenantStatus } from '../types';
import { convertKeysToJwkSecp256k1 } from './convertKeysToJwkSecp256k1';
import { createOidcProviderConfig } from './createOidcProviderConfig';
import type { ClaimMapping } from './oidcProfileClaimMappings';
import type { TTAgent } from './setupVeramo';
import { setupVeramo } from './setupVeramo';

export const getSchemaName = (uuid: string) => 't_' + uuid.split('-')[0];

const createConnOption: (tenant: Tenant) => ConnectionOptions = (tenant) => ({
  name: tenant.id,
  type: 'postgres',
  host: tenant.db_host,
  port: tenant.db_port,
  username: tenant.db_username,
  password: tenant.db_password,
  database: tenant.db_name,
  synchronize: true,
  // TODO: logging changes to configurable
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    ...Entities,
    OidcCredential,
    OidcClient,
    OidcIssuer,
    OidcFederatedProvider,
    OidcVerifier,
    OidcPayload,
  ],
  schema: getSchemaName(tenant.id),
});

const debug = Debug('utils:createTenantManager');

export const createTenantManager: (commonConnection: Connection) => TenantManager = (
  commonConnection
) => {
  // connectionPromises' key is "tenantId"
  let connectionPromises: Record<string, Promise<Connection>>;

  // agents' key is "slug"
  const agents: Record<string, TTAgent> = {};

  // oidcProvider's key is "tenantId"
  const oidcProivders: Record<string, Provider> = {};
  const tenantRepo = getConnection('default').getRepository(Tenant);

  return {
    createOrGetOidcProvider: async ({
      hostname,
      tenantId,
      issuerId,
      verifierId,
      isIssuerOrVerifier,
    }) => {
      // step 1: Add did to new Tenant; which generate key pair, for use by Oidc provider's jwks_uri
      const slug = hostname.split('.')[0];
      const agent = agents[slug];
      const agentArgs: IDIDManagerGetOrCreateArgs = {
        alias: tenantId,
        provider: 'did:key',
        // Ed22519 is the required key for did:key
        // options: { keyType: 'Ed25519' },
        kms: 'local',
      };
      const identifier: IIdentifier = await agent.execute('didManagerGetOrCreate', agentArgs);

      if (!identifier) throw new Error('fail to create did');

      // step 2: retrieve keys
      const getKeyArgs: IKeyManagerGetArgs = { kid: identifier.controllerKeyId };
      const key: IKey = await agent.execute('keyManagerGet', getKeyArgs);

      if (!key) throw new Error('fail to retrieve key');

      // Veramo's did:key is in format of publicKeyHex and privateKeyHex
      const keyJwk = convertKeysToJwkSecp256k1(key.publicKeyHex, key.privateKeyHex);
      const jwks = { keys: [keyJwk.privateKeyJwk] };

      // step 3: get or create Provider
      const path = `${isIssuerOrVerifier}s`;
      const uri =
        isIssuerOrVerifier === 'issuer'
          ? `https://${hostname}/oidc/${path}/${issuerId}`
          : `https://${hostname}/oidc/${path}/${verifierId}`;

      // New code: will fetch Oidc-issuer's claimMappings. And, will assign new provider
      let claimMappings: ClaimMapping[] = [];
      try {
        const issuerRepo = getConnection(tenantId).getRepository(OidcIssuer);
        const verifierRepo = getConnection(tenantId).getRepository(OidcVerifier);
        const result =
          isIssuerOrVerifier === 'issuer'
            ? await issuerRepo.findOne(issuerId)
            : await verifierRepo.findOne(verifierId);
        claimMappings &&= result.claimMappings;
      } catch (err) {
        console.error(err);
        console.warn('no claims are mapped');
      }

      // TODO: not 100% sure, if there is no memory leaked, for creating provider each time
      // it hanndles situtation: after claimMapping is updated, openid-configuration is reflected.
      const baseOption = { connectionName: tenantId, jwks, claimMappings, isIssuerOrVerifier };
      const providerOption =
        isIssuerOrVerifier === 'issuer'
          ? { ...baseOption, issuerId }
          : { ...baseOption, verifierId };

      oidcProivders[tenantId] = new Provider(uri, createOidcProviderConfig(providerOption));

      // see https://github.com/panva/node-oidc-provider/tree/main/docs#trusting-tls-offloading-proxies
      oidcProivders[tenantId].proxy = true;
      return oidcProivders[tenantId];
    },
    /**
     * activate will create new psql schema. Agent will be ready to use, after activation
     */
    activate: async (tenantId) => {
      let tenant: Tenant;
      let isTenantExist = false;
      let isTenantUpdated = false;
      let isSchemaExist = false;
      let isAgentReady = false;

      // Step 0: retrieve tenant
      debug('activate: %s', tenantId);

      try {
        tenant = await tenantRepo.findOne({ where: { id: tenantId } });
        isTenantExist = !!tenant;
      } catch (e) {
        console.error(util.format('fail to retrieve tentant, %j', e));
      }
      if (!tenant) throw new Error('tenant not found');

      debug('tenant found, %s', tenantId);

      // step 1: check schema
      console.log('Create schema if not exist,... ');
      try {
        await commonConnection.query(`CREATE SCHEMA IF NOT EXISTS ${getSchemaName(tenant.id)}`);
        // above call returns []
        isSchemaExist = true;
      } catch (e) {
        console.warn(util.format('fail to create schema %s:, %j', tenant.id, e));
      }
      if (!isSchemaExist) throw new Error('fail to create psql schema');

      // step 2: add connectionPromise
      const connectionOption = createConnOption(tenant);
      const { name } = connectionOption; // this is tenantId

      if (connectionPromises[name]) {
        console.warn('connectionPromise already exists');
        throw new Error('fail to activate; tenant already exist.');
      }
      const promise = createConnection(connectionOption);
      connectionPromises[name] = promise;

      // step 3: add agent
      try {
        // NOTE: This is using slug
        agents[tenant.slug] = setupVeramo(promise);
        isAgentReady = true;
      } catch (e) {
        console.warn(util.format('fail to setup Agent %s, %j', tenant.id, e));
      }
      if (!isAgentReady) throw new Error('fail to setup Agent');

      // step 4: update Tenant
      try {
        const result = await tenantRepo.update(tenant.id, { activated: true });

        debug('update "activated": %O', result);

        result?.affected === 1 && (isTenantUpdated = true);
      } catch (e) {
        console.warn(util.format('fail to update Tenant %s, %j', tenant.id, e));
      }
      if (!isTenantUpdated) throw new Error('fail to update tenant');

      return isAgentReady && isTenantExist && isSchemaExist && isTenantUpdated;
    },
    /**
     * ConnectAllDatabases when server starts
     */
    connectAllDatabases: async () => {
      const connectionPromiseArr = [];
      const tenants = await tenantRepo.find({ where: { activated: true } });

      for await (const tenant of tenants) {
        try {
          debug('Creating schema, if not exist');

          await commonConnection.query(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${getSchemaName(
              tenant.id
            )}';`
          );
          const option = createConnOption(tenant);
          const conn = createConnection(option);
          connectionPromiseArr.push({ [option.name]: conn });
        } catch {
          console.warn(`Schema for ${tenant.slug} does not exists`);
        }
      }
      connectionPromises = connectionPromiseArr.reduce((prev, curr) => ({ ...prev, ...curr }), {});
    },
    deactivate: async (tenantId) => {
      const tenant = await tenantRepo.findOne(tenantId);

      // remove connectionPromise
      delete connectionPromises[tenantId];

      // remove agent with slug
      delete agents[tenant.slug];

      // update tenant
      try {
        const result = await tenantRepo.update(tenantId, { activated: false });
        return result?.affected === 1;
      } catch (error) {
        console.warn(util.format('fail to update Tenant %s, %j', tenantId, error));
      }
      return false;
    },
    getAgents: () => agents,
    getConnectionPromises: () => connectionPromises,
    getTenantStatus: async (tenantId) => {
      let isActivated: boolean;
      let isSchemaExist: boolean;
      let isAgentReady: boolean;

      try {
        await commonConnection.query(
          `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${getSchemaName(
            tenantId
          )}';`
        );
        isSchemaExist = true;
      } catch {
        console.log('no schema returned');
      }

      let tenant: Tenant;
      try {
        tenant = await tenantRepo.findOne(tenantId);
        isActivated = tenant?.activated;
        isAgentReady = !!agents[tenant.slug];
      } catch (e) {
        console.warn(util.format('fail to find tenant %s, %j', tenantId, e));
      }
      if (!tenant) throw new Error('tenant not found');

      return <TenantStatus>{
        isActivated,
        isSchemaExist,
        isAgentReady,
      };
    },
    getTenantSummary: async () => {
      const result: { schema_name: string }[] = await commonConnection.query(
        `SELECT schema_name FROM information_schema.schemata ;`
      );
      const schemaCount = result
        ?.map(({ schema_name }) => schema_name)
        .filter(
          (schema) =>
            !includes(
              [
                'pg_toast',
                'pg_temp_1',
                'pg_toast_temp_1',
                'pg_catalog',
                'public',
                'information_schema',
              ],
              schema
            )
        ).length;
      return {
        agentCount: Object.keys(agents)?.length,
        schemaCount,
      };
    },
    setupAgents: async () => {
      for await (const [tenantId, promise] of Object.entries(connectionPromises)) {
        debug('Setup agents: ' + tenantId);

        const tenant = await tenantRepo.findOne(tenantId);
        tenant && (agents[tenant.slug] = setupVeramo(promise));
      }
    },
  };
};

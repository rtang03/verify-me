import util from 'util';
import { Entities } from '@veramo/data-store';
import Debug from 'debug';
import includes from 'lodash/includes';
import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import type { TenantManager, TenantStatus } from '../types';
import type { TTAgent } from './setupVeramo';
import { setupVeramo } from './setupVeramo';

const createConnOption: (tenant: Tenant) => ConnectionOptions = (tenant) => ({
  name: tenant.id,
  type: 'postgres',
  host: tenant.db_host,
  port: tenant.db_port,
  username: tenant.db_username,
  password: tenant.db_password,
  database: tenant.db_name,
  synchronize: false,
  logging: true,
  entities: Entities,
  schema: tenant.id,
});

const debug = Debug('utils:createTenantManager');

export const createTenantManager: (commonConnection: Connection) => TenantManager = (
  commonConnection
) => {
  let connectionPromises: Record<string, Promise<Connection>>;
  let connections: Record<string, Connection> = {};
  // NOTE: agents' key is "slug"; NOT "tenantId"
  const agents: Record<string, TTAgent> = {};
  const tenantRepo = getConnection('default').getRepository(Tenant);

  return {
    activiate: async (tenantId) => {
      let tenant: Tenant;
      let isTenantExist: boolean;
      let isTenantUpdated: boolean;
      let isSchemaExist: boolean;
      let isConnectionReady: boolean;
      let isAgentReady: boolean;

      // Step 0: retrieve tenant
      try {
        tenant = await tenantRepo.findOne({ where: { id: tenantId } });
        isTenantExist = true;
      } catch (e) {
        console.error(util.format('fail to retrieve tentant, %j', e));
      }
      if (!tenant) throw new Error('tenant not found');

      // step 1: check schema
      console.log('Create schema if not exist,... ');
      try {
        const result = await commonConnection.query(`CREATE SCHEMA IF NOT EXISTS ${tenant.id}`);
        console.log(result);
        isSchemaExist = true;
      } catch (e) {
        console.warn(util.format('fail to create schema %s:, %j', tenant.id, e));
      }

      // step 2: add connectionPromise
      const connectionOption = createConnOption(tenant);
      const { name } = connectionOption; // this is tenantId

      if (connectionPromises[name]) console.warn('connectionPromise already exists');
      const promise = createConnection(connectionOption);
      connectionPromises[name] = promise;

      // step 3: add connection
      if (connections[name]) console.warn('connection already exists');
      let connection: Connection;
      try {
        connection = await promise;
        isConnectionReady = true;
      } catch (e) {
        console.warn(util.format('fail to create connection %s, %j', tenant.id, e));
      }
      connections[name] = connection;

      // step 4: add agent
      try {
        // NOTE: This is using slug
        agents[tenant.slug] = setupVeramo(promise);
        isAgentReady = true;
      } catch (e) {
        console.warn(util.format('fail to setup Agent %s, %j', tenant.id, e));
      }

      // step 5: update Tenant
      try {
        const result = await tenantRepo.update(tenant.id, { activated: true });
        result?.affected === 1 && (isTenantUpdated = true);
      } catch (e) {
        console.warn(util.format('fail to update Tenant %s, %j', tenant.id, e));
      }

      return isAgentReady && isConnectionReady && isTenantExist && isSchemaExist && isTenantUpdated;
    },
    closeAllConnections: async () => {
      for await (const [tenantId, c] of Object.entries(connections)) {
        await c.close();
        console.log(`Connection ${tenantId} is closed`);
      }
    },
    connectAllDatabases: async () => {
      const connectionPromiseArr = [];
      const connectionArr = [];
      const tenants = await tenantRepo.find({ where: { activated: true } });

      for await (const tenant of tenants) {
        try {
          await commonConnection.query(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${tenant.id}';`
          );
          const option = createConnOption(tenant);
          const conn = createConnection(option);
          connectionPromiseArr.push({ [option.name]: conn });
          const connection = await conn;
          connectionArr.push({ [option.name]: connection });
        } catch {
          console.warn(`Schema for ${tenant.slug} does not exists`);
        }
        debug(connections);
      }
      connectionPromises = connectionPromiseArr.reduce((prev, curr) => ({ ...prev, ...curr }), {});
      connections = connectionArr.reduce((prev, curr) => ({ ...prev, ...curr }), {});
    },
    deactivate: async (tenantId) => {
      const tenant = await tenantRepo.findOne(tenantId);

      // remove connectionPromise
      delete connectionPromises[tenantId];

      // remove connection
      try {
        await connections[tenantId].close();
      } catch (error) {
        console.warn(error);
      }
      delete connections[tenantId];

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
    getConnections: () => connections,
    getConnectionStatuses: () =>
      Object.entries(connections)
        .map(([tenantId, c]) => ({ [tenantId]: c.isConnected }))
        .reduce((prev, curr) => ({ ...prev, ...curr }), {}),
    getTenantStatus: async (tenantId) => {
      let isActivated: boolean;
      let isSchemaExist: boolean;
      let isAgentReady: boolean;

      try {
        await commonConnection.query(
          `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${tenantId}';`
        );
        isSchemaExist = true;
      } catch {
        console.log('no schema returned');
      }

      try {
        const tenant = await tenantRepo.findOne(tenantId);
        isActivated = tenant?.activated;
        isAgentReady = !!agents[tenant.slug];
      } catch (e) {
        console.warn(util.format('fail to find tenant %s, %j', tenantId, e));
      }

      return <TenantStatus>{
        isActivated,
        isSchemaExist,
        isConnectionReady: !!connections[tenantId],
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
        connectionCount: Object.keys(connections)?.length,
        agentCount: Object.keys(agents)?.length,
        schemaCount,
      };
    },
    setupAgents: async () => {
      for await (const [tenantId, promise] of Object.entries(connectionPromises)) {
        const tenant = await tenantRepo.findOne(tenantId);
        tenant && (agents[tenant.slug] = setupVeramo(promise));
      }
    },
  };
};

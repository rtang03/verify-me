import type { IDIDManagerGetOrCreateArgs, IIdentifier } from '@veramo/core';
import Debug from 'debug';
import Status from 'http-status';
import { nanoid } from 'nanoid';
import { getConnection } from 'typeorm';
import { OidcCredential, OidcFederatedProvider, OidcIssuer } from '../entities';
import type { Paginated, RequestWithVhost, TenantManager } from '../types';
import { createRestRoute, isCreateOidcIssuerArgs } from '../utils';

const debug = Debug('utils:createOidcIssuerRoute');

/**
 * Restful api for /oidc/issuers, being invoked via createOidcRoute.ts
 */
export const createOidcIssuerRoute = (tenantManger: TenantManager) =>
  createRestRoute({
    GET: async (req: RequestWithVhost, res) => {
      const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
      const items = await issuerRepo.findByIds([req.params.id], {
        relations: ['credential', 'federatedProvider'],
      });
      const data: Paginated<OidcIssuer> = {
        total: items.length,
        cursor: items.length,
        hasMore: false,
        items,
      };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    GET_ALL: async (req: RequestWithVhost, res, skip, take) => {
      const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
      const [items, total] = await issuerRepo.findAndCount({
        skip,
        take,
        relations: ['credential', 'federatedProvider'],
      });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const data = <Paginated<OidcIssuer>>{ total, cursor, hasMore, items };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    // TODO: currently, there is no check in CREATE. Need the check, before adding negative test cases.
    POST: async (req: RequestWithVhost, res) => {
      const body: unknown = req.body;

      debug('body: %O', body);

      // NOTE: When running Jest, we need a FIXED Oidc-issuer Id, so that the federated oidc provider is
      // configured with fixed "allowed Callback url"
      const isRunningJest = process.env.NODE_ENV === 'test';
      const id = isRunningJest ? process.env.JEST_FIXED_OIDC_ISSUER_ID : nanoid();

      isRunningJest && console.log('create fixed Id for TEST purpose');

      if (isCreateOidcIssuerArgs(body)) {
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
        const providerRepo = getConnection(req.tenantId).getRepository(OidcFederatedProvider);

        // Add did to new Oidc issuer
        const slug = req.vhost[0];
        const agent = tenantManger.getAgents()[slug];
        const agentArgs: IDIDManagerGetOrCreateArgs = {
          alias: id, // oidc-issuer 's id
          provider: 'did:key',
          kms: 'local',
        };
        const identifier: IIdentifier = await agent.execute('didManagerGetOrCreate', agentArgs);

        debug('oidc-issuer did, %O', identifier);

        if (!identifier)
          return res
            .status(Status.BAD_REQUEST)
            .send({ status: 'ERROR', error: 'fail to create did' });

        const credential = new OidcCredential();
        credential.context = body.credential.context;
        credential.description = body.credential.description;
        credential.issuerDid = body.credential.issuerDid;
        credential.name = body.credential.name;
        credential.type = body.credential.type;

        // const defaultUrl = `https://${req.hostname}/oidc/issuers/callback`;
        const provider = new OidcFederatedProvider();
        provider.url = body.federatedProvider.url;
        // provider.callbackUrl = body?.federatedProvider?.callbackUrl || defaultUrl;
        provider.scope = body.federatedProvider.scope;
        provider.clientId = body.federatedProvider.clientId;
        provider.clientSecret = body.federatedProvider.clientSecret;

        const issuer = new OidcIssuer();
        issuer.id = id;
        issuer.credential = credential;
        issuer.federatedProvider = provider;
        issuer.claimMappings = body.claimMappings;

        // OidcIssuer is bound to Did (and also its key)
        issuer.did = identifier.did;

        // cascade insert
        const data = await issuerRepo.save(issuer);

        // update the callbackUrl
        const issuerId = data.id;
        const federatedProviderId = data.federatedProvider.id;
        const callbackUrl = `https://${req.hostname}/oidc/issuers/${issuerId}/callback`;
        await providerRepo.update(federatedProviderId, { callbackUrl });

        debug('POST /oidc/issuers, %O', data);

        res.status(Status.CREATED).send({ status: 'OK', data });
      } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });
    },
    DELETE: async (req: RequestWithVhost, res) => {
      const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
      const data = await issuerRepo.delete(req.params.id);
      res.status(Status.OK).send({ status: 'OK', data });
    },
    PUT: async (req: RequestWithVhost, res) => {
      const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
      const body = req.body;

      // TODO: need some validation here
      // e.g. add typeguard "isUpdateIssuerClientArg"

      const data = await issuerRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

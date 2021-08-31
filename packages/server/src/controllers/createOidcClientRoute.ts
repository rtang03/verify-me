import { randomBytes } from 'crypto';
import type { IDIDManagerGetOrCreateArgs, IIdentifier } from '@veramo/core';
import Debug from 'debug';
import type { Request } from 'express';
import Status from 'http-status';
import { nanoid } from 'nanoid';
import { getConnection } from 'typeorm';
import { OidcClient } from '../entities';
import type { Paginated } from '../types';
import type { TenantManager } from '../types';
import { createRestRoute, isCreateOidcIssuerClientArgs } from '../utils';

interface RequestWithVhost extends Request {
  vhost?: any;
  tenantId?: string;
  issuerId?: string;
}

const debug = Debug('utils:createOidcClientRoute');

export const createOidcClientRoute = (tenantManger: TenantManager) =>
  createRestRoute({
    GET: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const clientId = req.params.id;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
      const items = await clientRepo.find({ where: { issuerId, client_id: clientId } });

      const data = <Paginated<OidcClient>>{
        total: items.length,
        cursor: items.length,
        hasMore: false,
        items,
      };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    GET_ALL: async (req: RequestWithVhost, res, skip, take) => {
      const issuerId = req.issuerId;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
      const where = { where: { issuerId } };
      const [items, total] = await clientRepo.findAndCount({ skip, take, ...where });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const data = <Paginated<OidcClient>>{
        total,
        cursor,
        hasMore,
        items,
      };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    POST: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const body: unknown = req.body;

      // NOTE: When running Jest, we need a FIXED Oidc-issuer Id, so that the federated oidc provider is
      // configured with fixed "allowed Callback url"
      const isRunningJest = process.env.NODE_ENV === 'test';
      const id = isRunningJest ? process.env.JEST_FIXED_OIDC_CLIENT_ID : nanoid();

      if (isCreateOidcIssuerClientArgs(body)) {
        const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

        // Add did to new Oidc-client
        const slug = req.vhost[0];
        const agent = tenantManger.getAgents()[slug];
        const agentArgs: IDIDManagerGetOrCreateArgs = {
          alias: id, // oidc-client 's id
          provider: 'did:key',
          kms: 'local',
        };
        const identifier: IIdentifier = await agent.execute('didManagerGetOrCreate', agentArgs);

        debug('oidc-client did, %O', identifier);

        if (!identifier)
          return res
            .status(Status.BAD_REQUEST)
            .send({ status: 'ERROR', error: 'fail to create did' });

        const client = new OidcClient();
        client.client_id = id;
        client.client_name = body.client_name;
        client.redirect_uris = body.redirect_uris;
        client.response_types = body.response_types;
        client.grant_types = body.grant_types;
        client.token_endpoint_auth_method = body.token_endpoint_auth_method;
        client.id_token_signed_response_alg = body.id_token_signed_response_alg;
        client.application_type = body.application_type;
        client.issuerId = issuerId;
        client.client_secret = randomBytes(12).toString('hex');

        // OidcClient is bound to Did (and also its key)
        client.did = identifier.did;

        const data = await clientRepo.save(client);

        debug('POST /oidc/issuers/:id/clients, %O', data);

        res.status(Status.CREATED).send({ status: 'OK', data });
      } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });
    },
    DELETE: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const clientId = req.params.id;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

      // ensure the client belongings to this issuer
      const client = await clientRepo.findOne({ where: { issuerId, client_id: clientId } });

      if (client) {
        const data = await clientRepo.delete(clientId);
        res.status(Status.OK).send({ status: 'OK', data });
      } else
        res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: 'clientId and issuerId mismatch' });
    },
    PUT: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const clientId = req.params.id;
      const body = req.body;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
      const client = await clientRepo.findOne({ where: { issuerId, client_id: clientId } });

      // TODO: need some validation here
      // e.g. add typeguard "isUpdateOidcClientArg"

      if (client) {
        const data = await clientRepo.update(req.params.id, body);
        res.status(Status.OK).send({ status: 'OK', data });
      } else
        res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: 'clientId and issuerId mismatch' });
    },
  });

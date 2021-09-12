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
import { SigningAlgorithmWithNone } from 'oidc-provider';

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

        // Note: Add did to new Oidc-client here, using Veramo agent
        // Hence, we do NOT use OneOnOne JoinColumn in OidcClient with auto cascade
        const slug = req.vhost[0];
        const agent = tenantManger.getAgents()[slug];

        // hardcoded key generation method
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

        const {
          grant_types,
          client_name,
          redirect_uris,
          token_endpoint_auth_method,
          response_types,
          id_token_signed_response_alg,
          application_type,
          backchannel_token_delivery_mode,
          backchannel_client_notification_endpoint,
          backchannel_authentication_request_signing_alg,
        } = body;

        const client = new OidcClient();
        // A. Common fields
        /* client_id */
        client.client_id = id;

        // GrantTypes determines the param requirement:
        // ['authorization_code'] or
        // ['urn:openid:params:grant-type:ciba'] or
        // ['authorization_code','urn:openid:params:grant-type:ciba']

        /* grant_types */
        client.grant_types = grant_types;

        const isAuthCodeFlow = grant_types.includes('authorization_code');
        const isCibaFlow = grant_types.includes('urn:openid:params:grant-type:ciba');

        /* client_name */
        client_name && (client.client_name = client_name);

        // B. Common mandatory fields
        /* issuerId */
        client.issuerId = issuerId;

        /* auto-gen client_secret */
        client.client_secret = randomBytes(12).toString('hex');

        /* token_endpoint_auth_method */
        if (!token_endpoint_auth_method) throw new Error('token_endpoint_auth_method is mandatory');
        client.token_endpoint_auth_method = token_endpoint_auth_method;

        /* application_type */
        if (!['web', 'native'].includes(application_type)) throw new Error('invalid value');
        client.application_type = application_type;

        // OidcClient is bound to Did (and also its key)
        /* did */
        client.did = identifier.did;

        // jwks_uri can jwks cannot coexist. Decide later which one should I use?
        /* jwks_uri */
        // client.jwks_uri = `https://${req.hostname}/oidc/issuers/${issuerId}/clients/${id}/jwks`;

        // C. (1) client metadata for auth_code flow
        if (isAuthCodeFlow) {
          /* mandatory: redirect_uris */
          if (!redirect_uris) throw new Error('redirect_uris is mandatory');
          client.redirect_uris = redirect_uris;

          /* mandatory: response_types */
          if (!response_types) throw new Error('response_types is mandatory');
          client.response_types = response_types;

          /* mandatory: id_token_signed_response_alg */
          if (!id_token_signed_response_alg)
            throw new Error('id_token_signed_response_alg is mandatory');
          client.id_token_signed_response_alg = id_token_signed_response_alg;

          client.backchannel_user_code_parameter = null;
        }

        // C. (2) Backchannel client
        if (isCibaFlow) {
          /* mandatory: backchannel_token_delivery_mode */
          if (!backchannel_token_delivery_mode)
            throw new Error('backchannel_token_delivery_mode is mandatory');

          if (!['ping', 'poll'].includes(backchannel_token_delivery_mode))
            throw new Error('only ping or poll allowed');
          client.backchannel_token_delivery_mode = backchannel_token_delivery_mode;

          /* optional: backchannel_client_notification_endpoint */
          backchannel_client_notification_endpoint &&
            (client.backchannel_client_notification_endpoint =
              backchannel_client_notification_endpoint);

          /* optional: backchannel_authentication_request_signing_alg */
          if (!['ES256K'].includes(backchannel_authentication_request_signing_alg))
            throw new Error('only ES245K is suppported');
          client.backchannel_authentication_request_signing_alg =
            (backchannel_authentication_request_signing_alg ||
              'ES256K') as SigningAlgorithmWithNone;

          /* optional: backchannel_user_code_parameter */
          // typeof backchannel_user_code_parameter === 'boolean' &&
          //   (client.backchannel_user_code_parameter = backchannel_user_code_parameter);
        }

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

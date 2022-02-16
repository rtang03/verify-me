import { randomBytes } from 'crypto';
import type { IDIDManagerGetOrCreateArgs, IIdentifier } from '@veramo/core';
import Debug from 'debug';
import Status from 'http-status';
import { nanoid } from 'nanoid';
import type { SigningAlgorithmWithNone } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { OidcClient } from '../entities';
import type { Paginated, RequestWithVhost } from '../types';
import type { TenantManager } from '../types';
import {
  createRestRoute,
  isCreateOidcIssuerClientArgs,
  isCreateOidcVerifierClientArgs,
} from '../utils';

const debug = Debug('utils:createOidcClientRoute');

export const createOidcClientRoute = (
  tenantManger: TenantManager,
  clientType: 'verifier' | 'issuer' = 'issuer'
) =>
  createRestRoute({
    GET: async (req: RequestWithVhost, res) => {
      const issuerId = clientType === 'issuer' ? req.issuerId : undefined;
      const verifierId = clientType === 'verifier' ? req.verifierId : undefined;

      const client_id = req.params.id;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

      const items = await clientRepo.find(
        clientType === 'issuer'
          ? { where: { issuerId, client_id } }
          : { where: { verifierId, client_id } }
      );

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
      const issuerId = clientType === 'issuer' ? req.issuerId : undefined;
      const verifierId = clientType === 'verifier' ? req.verifierId : undefined;

      const where = clientType === 'issuer' ? { issuerId } : { verifierId };

      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
      const [items, total] = await clientRepo.findAndCount({ skip, take, where });
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
      const issuerId = clientType === 'issuer' ? req.issuerId : undefined;
      const verifierId = clientType === 'verifier' ? req.verifierId : undefined;

      const body: unknown = req.body;

      // NOTE: When running Jest, we need a FIXED Oidc-issuer Id, so that the federated oidc provider is
      // configured with fixed "allowed Callback url"
      const isRunningJest = process.env.NODE_ENV === 'test';
      const id = isRunningJest ? process.env.JEST_FIXED_OIDC_CLIENT_ID : nanoid();
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

      // Note: Add did to new Oidc-client here, using Veramo agent
      // Hence, we do NOT use OneOnOne JoinColumn in OidcClient with auto cascade
      const slug = req.vhost[0];
      const agent = tenantManger.getAgents()[slug];
      const isValidArgs =
        clientType === 'issuer'
          ? isCreateOidcIssuerClientArgs(body)
          : isCreateOidcVerifierClientArgs(body);

      if (!isValidArgs)
        return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });

      // Key Generation
      const agentArgs: IDIDManagerGetOrCreateArgs = {
        alias: id,
        provider: 'did:key',
        kms: 'local',
      };
      const identifier: IIdentifier = await agent.execute('didManagerGetOrCreate', agentArgs);

      debug('oidc-client did, %O', identifier);

      if (!identifier)
        return res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: 'fail to create did' });
      // End of Key Generation

      const client = new OidcClient();

      /* client_id */
      client.client_id = id;

      /* did */
      client.did = identifier.did;

      /* auto-gen client_secret */
      client.client_secret = isRunningJest
        ? '123456123456123456123456'
        : randomBytes(12).toString('hex');

      if (clientType === 'issuer' && isCreateOidcIssuerClientArgs(body)) {
        const {
          grant_types,
          client_name,
          redirect_uris,
          token_endpoint_auth_method,
          response_types,
          id_token_signed_response_alg,
          application_type,
        } = body;

        /* grant_types */
        client.grant_types = grant_types;
        if (!grant_types.includes('authorization_code'))
          return res
            .status(Status.BAD_REQUEST)
            .send({ status: 'ERROR', error: 'only authorization_code is supported' });

        /* client_name */
        client_name && (client.client_name = client_name);

        /* issuerId */
        client.issuerId = issuerId;

        /* token_endpoint_auth_method */
        if (!token_endpoint_auth_method) throw new Error('token_endpoint_auth_method is mandatory');
        client.token_endpoint_auth_method = token_endpoint_auth_method;

        /* application_type */
        if (!['web', 'native'].includes(application_type)) throw new Error('invalid value');
        client.application_type = application_type;

        // TODO: jwks_uri can jwks cannot coexist. Decide later which one should I use?
        /* jwks_uri */
        // client.jwks_uri = `https://${req.hostname}/oidc/issuers/${issuerId}/clients/${id}/jwks`;

        /* redirect_uris */
        if (!redirect_uris) throw new Error('redirect_uris is mandatory');
        client.redirect_uris = redirect_uris;

        /* response_types */
        if (!response_types) throw new Error('response_types is mandatory');
        client.response_types = response_types;

        /* id_token_signed_response_alg */
        if (!id_token_signed_response_alg)
          throw new Error('id_token_signed_response_alg is mandatory');
        client.id_token_signed_response_alg = id_token_signed_response_alg;
      } else if (isCreateOidcVerifierClientArgs(body)) {
        const {
          grant_types,
          client_name,
          token_endpoint_auth_method,
          application_type,
          id_token_signed_response_alg,
          backchannel_token_delivery_mode,
          backchannel_client_notification_endpoint,
          // backchannel_authentication_request_signing_alg,
          redirect_uris,
        } = body;

        /* grant_types */
        client.grant_types = grant_types;
        if (!grant_types.includes('urn:openid:params:grant-type:ciba'))
          return res.status(Status.BAD_REQUEST).send({
            status: 'ERROR',
            error: 'only urn:openid:params:grant-type:ciba is supported',
          });

        /* client_name */
        client_name && (client.client_name = client_name);

        /* verifierId */
        client.verifierId = verifierId;

        /* token_endpoint_auth_method */
        if (!token_endpoint_auth_method) throw new Error('token_endpoint_auth_method is mandatory');
        client.token_endpoint_auth_method = token_endpoint_auth_method;

        /* application_type */
        if (!['web', 'native'].includes(application_type)) throw new Error('invalid value');
        client.application_type = application_type;

        /* backchannel_token_delivery_mode */
        if (!backchannel_token_delivery_mode)
          throw new Error('backchannel_token_delivery_mode is mandatory');

        if (!['ping', 'poll'].includes(backchannel_token_delivery_mode))
          throw new Error('only ping or poll allowed');
        client.backchannel_token_delivery_mode = backchannel_token_delivery_mode;

        /* backchannel_client_notification_endpoint */
        backchannel_client_notification_endpoint &&
          (client.backchannel_client_notification_endpoint =
            backchannel_client_notification_endpoint);

        /* backchannel_authentication_request_signing_alg */
        // if (!['ES256K'].includes(backchannel_authentication_request_signing_alg))
        //   throw new Error('only ES245K is suppported');
        // client.backchannel_authentication_request_signing_alg =
        //   (backchannel_authentication_request_signing_alg || 'ES256K') as SigningAlgorithmWithNone;

        /* optional: backchannel_user_code_parameter */
        // typeof backchannel_user_code_parameter === 'boolean' &&
        //   (client.backchannel_user_code_parameter = backchannel_user_code_parameter);
        /* id_token_signed_response_alg */
        if (!id_token_signed_response_alg)
          throw new Error('id_token_signed_response_alg is mandatory');
        client.id_token_signed_response_alg = id_token_signed_response_alg;

        /* redirect_uris */
        if (!redirect_uris) throw new Error('redirect_uris is mandatory');
        client.redirect_uris = redirect_uris;

        client.response_types = [];
      }

      const data = await clientRepo.save(client);

      debug('POST /oidc/issuers/:id/clients, %O', data);

      res.status(Status.CREATED).send({ status: 'OK', data });
    },
    DELETE: async (req: RequestWithVhost, res) => {
      const issuerId = clientType === 'issuer' ? req.issuerId : undefined;
      const verifierId = clientType === 'verifier' ? req.verifierId : undefined;

      const client_id = req.params.id;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

      // ensure the client belongings to this issuer
      const client = await clientRepo.findOne(
        clientType === 'issuer'
          ? { where: { issuerId, client_id } }
          : { where: { verifierId, client_id } }
      );

      if (client) {
        const data = await clientRepo.delete(client_id);
        res.status(Status.OK).send({ status: 'OK', data });
      } else
        res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: 'clientId and issuerId mismatch' });
    },
    PUT: async (req: RequestWithVhost, res) => {
      const issuerId = clientType === 'issuer' ? req.issuerId : undefined;
      const verifierId = clientType === 'verifier' ? req.verifierId : undefined;

      const client_id = req.params.id;
      const body = req.body;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

      const client = await clientRepo.findOne(
        clientType === 'issuer'
          ? { where: { issuerId, client_id } }
          : { where: { verifierId, client_id } }
      );

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

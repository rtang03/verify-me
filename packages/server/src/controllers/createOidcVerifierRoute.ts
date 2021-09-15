import type { IDIDManagerGetOrCreateArgs, IIdentifier } from '@veramo/core';
import Debug from 'debug';
import Status from 'http-status';
import { nanoid } from 'nanoid';
import { getConnection } from 'typeorm';
import { OidcVerifier } from '../entities';
import type { Paginated, RequestWithVhost, TenantManager } from '../types';
import { createRestRoute, isCreateOidcVerifierArgs } from '../utils';

const debug = Debug('utils:createOidcVerifierRoute');

/**
 * Restful api for /oidc/verifiers, being invoked via createOidcRoute.ts
 */
export const createOidcVerifierRoute = (tenantManger: TenantManager) =>
  createRestRoute({
    GET: async (req: RequestWithVhost, res) => {
      const verifierRepo = getConnection(req.tenantId).getRepository(OidcVerifier);
      const items = await verifierRepo.findByIds([req.params.id]);
      const data: Paginated<OidcVerifier> = {
        total: items.length,
        cursor: items.length,
        hasMore: false,
        items,
      };
      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    GET_ALL: async (req: RequestWithVhost, res, skip, take) => {
      const verifierRepo = getConnection(req.tenantId).getRepository(OidcVerifier);
      const [items, total] = await verifierRepo.findAndCount({ skip, take });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const data = <Paginated<OidcVerifier>>{ total, cursor, hasMore, items };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    POST: async (req: RequestWithVhost, res) => {
      debug('body: %O', req.body);

      const body: unknown = req.body;
      const isRunningJest = process.env.NODE_ENV === 'test';
      const id = isRunningJest ? process.env.JEST_FIXED_OIDC_VERIFIER_ID : nanoid();

      isRunningJest && console.log('create fixed Id for TEST purpose');

      if (isCreateOidcVerifierArgs(body)) {
        const verifierRepo = getConnection(req.tenantId).getRepository(OidcVerifier);

        // Add did to new Oidc issuer
        const slug = req.vhost[0];
        const agent = tenantManger.getAgents()[slug];
        const agentArgs: IDIDManagerGetOrCreateArgs = {
          alias: id, // oidc-issuer 's id
          provider: 'did:key',
          kms: 'local',
        };
        const identifier: IIdentifier = await agent.execute('didManagerGetOrCreate', agentArgs);

        debug('oidc-verifier did, %O', identifier);

        if (!identifier)
          return res
            .status(Status.BAD_REQUEST)
            .send({ status: 'ERROR', error: 'fail to create did' });

        const verifier = new OidcVerifier();
        verifier.id = id;
        verifier.did = identifier.did;
        verifier.claimMappings = body.claimMappings;
        verifier.presentationTemplateId = body.presentationTemplateId;

        const data = await verifierRepo.save(verifier);
        debug('POST /oidc/verifiers, %O', data);

        res.status(Status.CREATED).send({ status: 'OK', data });
      } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });
    },
    DELETE: async (req: RequestWithVhost, res) => {
      const verifierRepo = getConnection(req.tenantId).getRepository(OidcVerifier);
      const data = await verifierRepo.delete(req.params.id);
      res.status(Status.OK).send({ status: 'OK', data });
    },
    PUT: async (req: RequestWithVhost, res) => {
      const verifierRepo = getConnection(req.tenantId).getRepository(OidcVerifier);
      const body = req.body;

      // TODO: need some validation here

      const data = await verifierRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

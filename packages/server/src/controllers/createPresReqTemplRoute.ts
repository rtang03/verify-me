import Debug from 'debug';
import Status from 'http-status';
import { getConnection } from 'typeorm';
import { PresentationRequestTemplate } from '../entities';
import type { Paginated, RequestWithVhost, TenantManager } from '../types';
import { createRestRoute, isCreatePresReqTemplArgs } from '../utils';

const debug = Debug('utils:createPresReqTemplRoute');

/**
 * Restful api for /oidc/presentation_req_template, being invoked via createOidcRoute.ts
 * @param tenantManager
 */
export const createPresReqTemplRoute = (tenantManager: TenantManager) =>
  createRestRoute({
    GET: async (req: RequestWithVhost, res) => {
      const templateRepo = getConnection(req.tenantId).getRepository(PresentationRequestTemplate);
      const items = await templateRepo.findByIds([req.params.id]);
      const data: Paginated<PresentationRequestTemplate> = {
        total: items.length,
        cursor: items.length,
        hasMore: false,
        items,
      };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    GET_ALL: async (req: RequestWithVhost, res, skip, take) => {
      const templateRepo = getConnection(req.tenantId).getRepository(PresentationRequestTemplate);
      const [items, total] = await templateRepo.findAndCount({ skip, take });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const data = <Paginated<PresentationRequestTemplate>>{ total, cursor, hasMore, items };

      if (data?.total) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', data });
    },
    POST: async (req: RequestWithVhost, res) => {
      debug('body: %O', req.body);

      const body: unknown = req.body;

      if (isCreatePresReqTemplArgs(body)) {
        const templateRepo = getConnection(req.tenantId).getRepository(PresentationRequestTemplate);

        const presRequestTemplate = new PresentationRequestTemplate();
        presRequestTemplate.claims = body.claims;
        presRequestTemplate.alias = body.alias;

        const data = await templateRepo.save(presRequestTemplate);

        debug('POST /oidc/presentation_req_template, %O', data);

        res.status(Status.CREATED).send({ status: 'OK', data });
      } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });
    },
    DELETE: async (req: RequestWithVhost, res) => {
      const templateRepo = getConnection(req.tenantId).getRepository(PresentationRequestTemplate);
      const data = await templateRepo.delete(req.params.id);
      res.status(Status.OK).send({ status: 'OK', data });
    },
    PUT: async (req: RequestWithVhost, res) => {
      const templateRepo = getConnection(req.tenantId).getRepository(PresentationRequestTemplate);
      const body = req.body;
      // TODO: need some validation here

      const data = await templateRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

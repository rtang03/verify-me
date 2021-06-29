import { randomBytes } from 'crypto';
import Debug from 'debug';
import { Request } from 'express';
import Status from 'http-status';
import { getConnection } from 'typeorm';
import { OidcClient } from '../entities';
import type { CommonResponse, Paginated } from '../types';
import { createRestRoute, isCreateOidcIssuerClientArgs } from '../utils';

interface RequestWithVhost extends Request {
  vhost?: any;
  tenantId?: string;
  issuerId?: string;
}

const debug = Debug('utils:createOidcRoute');

export const createOidcClientRoute = () =>
  createRestRoute({
    GET: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const clientId = req.params.id;
      res.status(Status.OK).send({ issuerId, clientId });
    },
    GET_ALL: async (req: RequestWithVhost, res, skip, take) => {
      const issuerId = req.issuerId;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);

      const [items, total] = await clientRepo.findAndCount({ skip, take });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const response: CommonResponse<Paginated<OidcClient>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
      res.status(Status.OK).send(response);
    },
    POST: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const body: unknown = req.body;

      if (isCreateOidcIssuerClientArgs(body)) {
        const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
        const client = new OidcClient();
        client.name = body.name;
        client.redirectUris = body.redirectUris;
        client.responseTypes = body.responseTypes;
        client.grantTypes = body.grantTypes;
        client.tokenEndpointAuthMethod = body.tokenEndpointAuthMethod;
        client.idTokenSignedResponseAlg = body.idTokenSignedResponseAlg;
        client.applicationType = body.applicationType;
        client.issuerId = issuerId;
        client.secret = randomBytes(12).toString('hex');

        const data = await clientRepo.save(client);

        debug('POST /oidc/issuers/:id/clients, %O', data);

        res.status(Status.CREATED).send({ status: 'OK', data });
      } else res.status(Status.BAD_REQUEST).send({ error: 'invalid argument' });
    },
    DELETE: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
      const data = await clientRepo.delete(req.params.id);
      res.status(Status.OK).send({ status: 'OK', data });
    },
    PUT: async (req: RequestWithVhost, res) => {
      const issuerId = req.issuerId;
      const clientRepo = getConnection(req.tenantId).getRepository(OidcClient);
      const body = req.body;

      // TODO: need some validation here
      const data = await clientRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

import Debug from 'debug';
import { Request } from 'express';
import Status from 'http-status';
import { Connection, getConnection } from 'typeorm';
import { OidcCredential, OidcFederatedProvider, OidcIssuer } from '../entities';
import type { CommonResponse, Paginated } from '../types';
import { createRestRoute, isCreateOidcIssuerArgs } from '../utils';

interface RequestWithVhost extends Request {
  vhost?: any;
  dbConnection?: Promise<Connection>;
  tenantId?: string;
}

const debug = Debug('utils:createOidcRoute');

export const createOidcIssuerRoute = () =>
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
      if (data) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND' });
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
      const response: CommonResponse<Paginated<OidcIssuer>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
      res.status(Status.OK).send(response);
    },
    POST: async (req: RequestWithVhost, res) => {
      const body: unknown = req.body;

      if (isCreateOidcIssuerArgs(body)) {
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);

        // Todo: implement check later
        // const isExist = await issuerRepo.findOne({  });

        const credential = new OidcCredential();
        credential.context = body.credential.context;
        credential.description = body.credential.description;
        credential.issuerDid = body.credential.issuerDid;
        credential.name = body.credential.name;
        credential.type = body.credential.type;

        const provider = new OidcFederatedProvider();
        provider.url = body.federatedProvider.url;
        provider.callbackUrl = body.federatedProvider.callbackUrl;
        provider.scope = body.federatedProvider.scope;
        provider.clientId = body.federatedProvider.clientId;
        provider.clientSecret = body.federatedProvider.clientSecret;

        const issuer = new OidcIssuer();
        issuer.credential = credential;
        issuer.federatedProvider = provider;
        issuer.claimMappings = body.claimMappings;

        const data = await issuerRepo.save(issuer);

        debug('POST /oidc/issuers, %O', data);

        res.status(Status.CREATED).send({ status: 'OK', data });
      } else res.status(Status.BAD_REQUEST).send({ error: 'invalid argument' });
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

      const data = await issuerRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

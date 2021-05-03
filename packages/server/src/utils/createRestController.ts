import { Router } from 'express';
import Status from 'http-status';
import type { CommonResponse } from '../types';
import { createRestRoute } from './createRestRoute';
import type { TAgent } from './setupVeramo';

const parseDid: (did: string) => [provider: string, identifier: string] = (did) => {
  const parts = did.split(':');
  return [`${parts[0]}:${parts[1]}`, parts[2]];
};

export const createRestController: <TEntity>(option: {
  agent: TAgent;
  prepareEntityToCreate: (payload: any) => TEntity;
}) => Router = <TEntity>({ agent, prepareEntityToCreate }) =>
  createRestRoute({
    GET_ALL: async (req, res, skip, take) => {
      const data = await agent.didManagerFind({ provider: 'did:web' });
      const response = {
        status: 'OK',
        data: { total: null, cursor: 0, hasMore: null, items: data },
      };
      res.status(Status.OK).send(response);
    },
    GET: async (req, res) => {
      const [provider, alias] = parseDid(req.params.id);
      const data = await agent.didManagerGetByAlias({ alias, provider });
      let response: CommonResponse<TEntity>;
      if (data) {
        response = { status: 'OK', data };
        res.status(Status.OK).send(response);
      } else {
        response = { status: 'NOT_FOUND', data };
        res.status(Status.NOT_FOUND).send(response);
      }
    },
    POST: async (req, res) => {
      const alias = req?.body.alias;
      const method = req?.body.method;
      const data = await agent.didManagerCreate({ alias, provider: `did:${method}` });
      res.status(Status.CREATED).send({ status: 'OK', data });
    },
    DELETE: async (req, res) => {
      const [provider, _] = parseDid(req.params.id);
      const isDeleted = await agent.didManagerDelete({ did: req.params.id, provider });
      if (isDeleted) res.status(Status.OK).send({ status: 'OK', data: isDeleted });
      else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', data: isDeleted });
    },
  });

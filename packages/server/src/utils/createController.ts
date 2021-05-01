import { Router } from 'express';
import Status from 'http-status';
import { MongoEntityManager } from 'typeorm';
import type { CommonResponse, Paginated } from '../types';
import { NOT_FOUND, UNKNOWN_ERROR } from './constants';
import { createRestRoute } from './createRestRoute';

export const createController: <TEntity>(
  entity: any,
  option: {
    mongo: MongoEntityManager;
    prepareEntityToCreate: (payload: any) => TEntity;
  }
) => Router = <TEntity>(entity, { mongo, prepareEntityToCreate }) =>
  createRestRoute({
    GET_ALL: async (req, res, skip, take) => {
      const [items, total] = await mongo.findAndCount(entity, { skip, take });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const response: CommonResponse<Paginated<TEntity>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };

      res.status(Status.OK).send(response);
    },
    GET: async (req, res) => {
      const data = await mongo.findOne(entity, { id: req.params.id });
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
      const entityToSave = prepareEntityToCreate(req?.body);

      if (entityToSave) {
        const data = await mongo.save(entityToSave);
        res.status(Status.CREATED).send({ status: 'OK', data });
      } else {
        res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: UNKNOWN_ERROR });
      }
    },
    DELETE: async (req, res) => {
      const result = await mongo.deleteOne(entity, { id: req.params.id });
      const data = result?.result;

      if (data?.ok) {
        res.status(Status.OK).send({ status: 'OK', data });
      } else {
        res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', message: NOT_FOUND });
      }
    },
  });

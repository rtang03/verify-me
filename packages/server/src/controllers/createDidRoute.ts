import { Router } from 'express';
import Status from 'http-status';
import { MongoEntityManager } from 'typeorm';
import { DidDocument, VerificationMethod } from '../entities/DidDocument';
import type { CommonResponse, Paginated } from '../types';
import {
  createRestRoute,
  isCreateDidDocumentPayload,
  isDidDocument,
  isDidDocumentArray,
} from '../utils';

export const createDidRoute: (mongo: MongoEntityManager) => Router = (mongo) =>
  createRestRoute({
    GET_ALL: async (req, res, skip, take) => {
      const [items, total] = await mongo.findAndCount(DidDocument, { skip, take });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;

      if (isDidDocumentArray(items)) {
        const response: CommonResponse<Paginated<DidDocument>> = {
          status: 'OK',
          data: { total, cursor, hasMore, items },
        };

        res.status(Status.OK).send(response);
      } else res.status(Status.OK).send({ status: 'ERROR', message: 'fail to retrieve document' });
    },
    GET: async (req, res) => {
      const id = req.params.id;
      const data: unknown = await mongo.findOne(DidDocument, { id });

      if (isDidDocument(data)) {
        res.status(Status.OK).send({ status: 'OK', data });
      } else res.status(Status.OK).send({ status: 'ERROR', message: 'fail to retrieve document' });
    },
    POST: async (req, res) => {
      const payload: unknown = req?.body;

      if (isCreateDidDocumentPayload(payload)) {
        const { id, description, controllerKey } = payload;
        const didDocument = new DidDocument({ id, controllerKey, description });
        const verifiication = new VerificationMethod(`${id}#key1`, id, controllerKey);
        didDocument.verificationMethod = [verifiication];
        const data = await mongo.save<DidDocument>(didDocument);

        res.status(Status.OK).send({ status: 'OK', data });
      } else
        res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: 'payload not recognized' });
    },
    DELETE: async (req, res) => {
      const id = req.params.id;
      const result = await mongo.deleteOne(DidDocument, { id });
      const data = result?.result;
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

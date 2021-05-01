// import { Router } from 'express';
// import Status from 'http-status';
// import { MongoEntityManager } from 'typeorm';
// import { DidDocument, VerificationMethod } from '../entities/DidDocument';
// import type { GetPaginatedDidDocument } from '../types';
// import {
//   createRestRoute,
//   INVALID_PAYLOAD,
//   isCreateDidDocumentPayload,
//   isDidDocument,
//   isDidDocumentArray,
//   NOT_FOUND,
//   UNKNOWN_ERROR,
// } from '../utils';
//
// export const createDidRoute: (mongo: MongoEntityManager) => Router = (mongo) =>
//   createRestRoute({
//     GET_ALL: async (req, res, skip, take) => {
//       const [items, total] = await mongo.findAndCount(DidDocument, { skip, take });
//       const hasMore = skip + take < total;
//       const cursor = hasMore ? skip + take : total;
//
//       if (isDidDocumentArray(items)) {
//         const response: GetPaginatedDidDocument = {
//           status: 'OK',
//           data: { total, cursor, hasMore, items },
//         };
//
//         res.status(Status.OK).send(response);
//       } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: UNKNOWN_ERROR });
//     },
//     GET: async (req, res) => {
//       const data: unknown = await mongo.findOne(DidDocument, { id: req.params.id });
//
//       if (isDidDocument(data)) {
//         res.status(Status.OK).send({ status: 'OK', data });
//       } else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', message: NOT_FOUND });
//     },
//     POST: async (req, res) => {
//       const payload: unknown = req?.body;
//
//       if (isCreateDidDocumentPayload(payload)) {
//         const { id, description, controllerKey } = payload;
//         const didDocument = new DidDocument({ id, controllerKey, description });
//         const verifiication = new VerificationMethod(`${id}#key1`, id, controllerKey);
//         didDocument.verificationMethod = [verifiication];
//         const data = await mongo.save<DidDocument>(didDocument);
//
//         res.status(Status.CREATED).send({ status: 'OK', data });
//       } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: INVALID_PAYLOAD });
//     },
//     DELETE: async (req, res) => {
//       const result = await mongo.deleteOne(DidDocument, { id: req.params.id });
//       const data = result?.result;
//
//       if (data?.ok) res.status(Status.OK).send({ status: 'OK', data });
//       else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND', message: NOT_FOUND });
//     },
//   });

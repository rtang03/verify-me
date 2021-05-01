import { Router } from 'express';
import { MongoEntityManager } from 'typeorm';
import { DidDocument, VerificationMethod } from '../entities/DidDocument';
import { createController, isCreateDidDocumentPayload } from '../utils';

export const createDidRoute: (mongo: MongoEntityManager) => Router = (mongo) =>
  createController(DidDocument, {
    mongo,
    prepareEntityToCreate: (payload) => {
      if (isCreateDidDocumentPayload(payload)) {
        const id = payload.id;
        const description = payload.description;
        const controllerKey = payload.controllerKey;
        const didDocument = new DidDocument({ id, controllerKey, description });
        const verifiication = new VerificationMethod(`${id}#key1`, id, controllerKey);
        didDocument.verificationMethod = [verifiication];

        return didDocument;
      } else return null;
    },
  });

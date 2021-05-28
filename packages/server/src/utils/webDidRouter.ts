import { IDIDManager, TAgent } from '@veramo/core';
import { Request, Router } from 'express';
import Status from 'http-status';
import { createDidDocument } from './createDidDocument';

interface RequestWithAgentDIDManager extends Request {
  agent?: TAgent<IDIDManager>;
}

export const didDocEndpoint = '/.well-known/did.json';

export const WebDidDocRouter = (): Router => {
  const router = Router();
  const getAliasForRequest = (req: Request) => encodeURIComponent(req.hostname);

  router.get(didDocEndpoint, async (req: RequestWithAgentDIDManager, res) => {
    try {
      const serverIdentifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req),
      });
      const didDoc = createDidDocument(serverIdentifier);
      res.status(Status.OK).json(didDoc);
    } catch (e) {
      res.status(Status.NOT_FOUND).send(e);
    }
  });

  router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgentDIDManager, res) => {
    try {
      const identifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req) + ':' + req.params[0].replace('/', ':'),
      });
      const didDoc = createDidDocument(identifier);
      res.status(Status.OK).json(didDoc);
    } catch (e) {
      res.status(Status.NOT_FOUND).send(e);
    }
  });
  return router;
};

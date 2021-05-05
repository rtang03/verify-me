import { IDIDManager, IIdentifier, TAgent } from '@veramo/core';
import { Request, Router } from 'express';

interface RequestWithAgentDIDManager extends Request {
  agent?: TAgent<IDIDManager>;
}

export const didDocEndpoint = '/.well-known/did.json';

export const WebDidDocRouter = (): Router => {
  const router = Router();
  const didDocForIdentifier = (identifier: IIdentifier) => ({
    '@context': 'https://w3id.org/did/v1',
    id: identifier.did,
    verificationMethod: identifier.keys.map((key) => ({
      id: identifier.did + '#' + key.kid,
      type:
        key.type === 'Secp256k1'
          ? 'EcdsaSecp256k1VerificationKey2019'
          : 'Ed25519VerificationKey2018',
      controller: identifier.did,
      publicKeyHex: key.publicKeyHex,
    })),
    authentication: identifier.keys.map((key) => `${identifier.did}#${key.kid}`),
    service: identifier.services,
  });

  const getAliasForRequest = (req: Request) => encodeURIComponent(req.hostname);

  router.get(didDocEndpoint, async (req: RequestWithAgentDIDManager, res) => {
    try {
      const serverIdentifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req),
      });
      const didDoc = didDocForIdentifier(serverIdentifier);
      res.json(didDoc);
    } catch (e) {
      res.status(404).send(e);
    }
  });

  router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgentDIDManager, res) => {
    try {
      const identifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req) + ':' + req.params[0].replace('/', ':'),
      });
      const didDoc = didDocForIdentifier(identifier);
      res.json(didDoc);
    } catch (e) {
      res.status(404).send(e);
    }
  });
  return router;
};

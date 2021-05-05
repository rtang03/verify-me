// import { IDIDManager, IIdentifier, TAgent } from '@veramo/core';
// import { Entities } from '@veramo/data-store';
// import { AgentRouter, ApiSchemaRouter, RequestWithAgentRouter } from '@veramo/remote-server';
// import express, { Request, Router } from 'express';
// import { ConnectionOptions, createConnection } from 'typeorm';
// import { setupVeramo, TTAgent } from './utils';
//
// interface RequestWithAgentDIDManager extends Request {
//   agent?: TAgent<IDIDManager>;
// }
//
// export const didDocEndpoint = '/.well-known/did.json';
//
// export const WebDidDocRouter = (): Router => {
//   const router = Router();
//   const didDocForIdentifier = (identifier: IIdentifier) => ({
//     '@context': 'https://w3id.org/did/v1',
//     id: identifier.did,
//     verificationMethod: identifier.keys.map((key) => ({
//       id: identifier.did + '#' + key.kid,
//       type:
//         key.type === 'Secp256k1'
//           ? 'EcdsaSecp256k1VerificationKey2019'
//           : 'Ed25519VerificationKey2018',
//       controller: identifier.did,
//       publicKeyHex: key.publicKeyHex,
//     })),
//     authentication: identifier.keys.map((key) => `${identifier.did}#${key.kid}`),
//     service: identifier.services,
//   });
//
//   const getAliasForRequest = (req: Request) => encodeURIComponent(req.hostname);
//
//   router.get(didDocEndpoint, async (req: RequestWithAgentDIDManager, res) => {
//     try {
//       const serverIdentifier = await req.agent.didManagerGet({
//         did: 'did:web:' + getAliasForRequest(req),
//       });
//       const didDoc = didDocForIdentifier(serverIdentifier);
//       res.json(didDoc);
//     } catch (e) {
//       res.status(404).send(e);
//     }
//   });
//
//   router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgentDIDManager, res) => {
//     try {
//       const identifier = await req.agent.didManagerGet({
//         did: 'did:web:' + getAliasForRequest(req) + ':' + req.params[0].replace('/', ':'),
//       });
//       const didDoc = didDocForIdentifier(identifier);
//       res.json(didDoc);
//     } catch (e) {
//       res.status(404).send(e);
//     }
//   });
//   return router;
// };
//
// const connectionOptions: ConnectionOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'docker',
//   database: 'auth_db',
//   synchronize: true,
//   logging: true,
//   entities: Entities,
// };
// const agent: TTAgent = setupVeramo(createConnection(connectionOptions));
// const exposedMethods = agent.availableMethods();
// const agentRouter = AgentRouter({ exposedMethods });
// const schemaRouter = ApiSchemaRouter({ exposedMethods, basePath: '/open-api.json' });
// const requestWithAgentRouter = RequestWithAgentRouter({ agent });
//
// const didDocRouter = WebDidDocRouter();
//
// const app = express();
//
// app.use(requestWithAgentRouter);
// app.use('/agent', agentRouter);
// app.use('/open-api.json', schemaRouter);
// app.use(didDocRouter);
// app.listen(3002);

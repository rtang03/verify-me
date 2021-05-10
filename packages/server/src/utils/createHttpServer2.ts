import { Credential, Identifier } from '@veramo/data-store';
import {
  AgentRouter,
  ApiSchemaRouter,
  RequestWithAgentRouter,
  MessagingRouter,
} from '@veramo/remote-server';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Connection, ConnectionOptions, createConnection, getRepository } from 'typeorm';
import { createIdentifierRoute, createIssuerRoute } from '../controllers';
import { setupVeramo, TTAgent } from './setupVeramo';
import { WebDidDocRouter } from './webDidRouter';

export const createHttpServer2: (option: {
  connectionOptions: ConnectionOptions;
  baseUrl?: string;
}) => Promise<Express> = async ({ connectionOptions, baseUrl }) => {
  let agent: TTAgent;
  let connection: Promise<Connection>;

  try {
    connection = createConnection(connectionOptions);
    await connection;
    agent = setupVeramo(connection);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  const exposedMethods = agent.availableMethods();
  const agentRouter = AgentRouter({ exposedMethods });
  const schemaRouter = ApiSchemaRouter({ exposedMethods, basePath: '/open-api.json' });
  const requestWithAgentRouter = RequestWithAgentRouter({ agent });
  const didDocRouter = WebDidDocRouter();
  const messageRouter = MessagingRouter({ metaData: { type: 'DIDComm' } });
  const credentialRepo = getRepository(Credential);
  const identifierRepo = getRepository(Identifier);
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));
  app.use(helmet());
  baseUrl && app.use(cors({ origin: baseUrl }));

  app.use(requestWithAgentRouter);
  // all agent methods
  app.use('/agent', agentRouter);
  // api schema
  app.use('/open-api.json', schemaRouter);
  // e.g. /.well-known/did.json
  app.use(didDocRouter);

  app.use(messageRouter);

  // /issuers/did:web:example.com/credentials
  app.use('/issuers', createIssuerRoute(credentialRepo));

  // /identifiers/did:web:example.com/users
  app.use('/identifiers', createIdentifierRoute(identifierRepo));

  // app.use('/tenants');
  // app.use('/accounts');
  // app.use('/users');

  return app;
};

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
import {
  Connection,
  ConnectionOptions,
  createConnection,
  createConnections,
  getConnection,
} from 'typeorm';
import { createAccountRoute, createTenantRoute, createUserRoute } from '../controllers';
import { Tenant } from '../entities/Tenant';
import { Users } from '../entities/Users';
import { setupVeramo, TTAgent } from './setupVeramo';
import { WebDidDocRouter } from './webDidRouter';
import { Accounts } from '../entities/Accounts';

export const createHttpServer: (option: {
  connectionOptions?: ConnectionOptions;
  commonConnectionOptions?: ConnectionOptions[];
  envVariables?: any;
  baseUrl?: string;
}) => Promise<Express> = async ({
  connectionOptions,
  commonConnectionOptions,
  envVariables,
  baseUrl,
}) => {
  let agent: TTAgent;
  let connection: Promise<Connection>;
  let commonConnection: Promise<Connection>;

  try {
    // connection = createConnection(connectionOptions);
    // commonConnection = createConnection(commonConnectionOptions);
    // await connection;
    // await commonConnection;
    await createConnections(commonConnectionOptions);
    // agent = setupVeramo(connection);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  // const exposedMethods = agent.availableMethods();
  // const agentRouter = AgentRouter({ exposedMethods });
  // const schemaRouter = ApiSchemaRouter({ exposedMethods, basePath: '/open-api.json' });
  // const requestWithAgentRouter = RequestWithAgentRouter({ agent });
  // const didDocRouter = WebDidDocRouter();
  // const messageRouter = MessagingRouter({ metaData: { type: 'DIDComm' } });
  const tenantRepo = getConnection('default').getRepository(Tenant);
  const usersRepo = getConnection('default').getRepository(Users);
  const accountsRepo = getConnection('default').getRepository(Accounts);
  // const credentialRepo = getRepository(Credential);
  // const identifierRepo = getRepository(Identifier);
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));
  app.use(helmet());
  baseUrl && app.use(cors({ origin: baseUrl }));

  // app.use(requestWithAgentRouter);

  // all agent methods
  // app.use('/agent', agentRouter);

  // api schema
  // app.use('/open-api.json', schemaRouter);

  // e.g. /.well-known/did.json
  // app.use(didDocRouter);

  // app.use(messageRouter);

  app.use('/tenants', createTenantRoute(tenantRepo, usersRepo, envVariables));
  app.use('/users', createUserRoute(usersRepo));
  app.use('/accounts', createAccountRoute(accountsRepo));

  // /issuers/did:web:example.com/credentials
  // app.use('/issuers', createIssuerRoute(credentialRepo));

  // /identifiers/did:web:example.com/users
  // app.use('/identifiers', createIdentifierRoute(identifierRepo));

  // app.use('/accounts');
  // app.use('/users');

  return app;
};

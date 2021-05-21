import { ApiSchemaRouter, MessagingRouter } from '@veramo/remote-server';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Connection, ConnectionOptions, createConnections, getConnection } from 'typeorm';
import vhost from 'vhost';
import {
  createAccountRoute,
  createTenantRoute,
  createUserRoute,
  createVirualHostRouter,
} from '../controllers';
import { Accounts } from '../entities/Accounts';
import { Tenant } from '../entities/Tenant';
import { Users } from '../entities/Users';
import { connectAllDatabases, setupAgents } from './connectionManager';
import { WebDidDocRouter } from './webDidRouter';

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
  let commonConnections: Connection[];
  try {
    // Connect common connection
    commonConnections = await createConnections(commonConnectionOptions);
  } catch (e) {
    console.error('Fail to create common connection');
    console.error(e);
    process.exit(1);
  }

  try {
    // Connect all pre-existing tenants
    await connectAllDatabases(commonConnections[0]);
  } catch (e) {
    console.error('Fail to create tenant connections');
    console.error(e);
    process.exit(1);
  }

  try {
    // setup agents
    setupAgents();
  } catch (e) {
    console.error('Fail to setup agents');
    console.error(e);
    process.exit(1);
  }

  // const schemaRouter = ApiSchemaRouter({ exposedMethods, basePath: '/open-api.json' });
  // const requestWithAgentRouter = RequestWithAgentRouter({ agent });
  // const didDocRouter = WebDidDocRouter();
  // const messageRouter = MessagingRouter({ metaData: { type: 'DIDComm' } });
  const tenantRepo = getConnection('default').getRepository(Tenant);
  const usersRepo = getConnection('default').getRepository(Users);
  const accountsRepo = getConnection('default').getRepository(Accounts);
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
  app.use(vhost('*.*.*', createVirualHostRouter(commonConnections[0])));

  // /issuers/did:web:example.com/credentials
  // app.use('/issuers', createIssuerRoute(credentialRepo));

  // /identifiers/did:web:example.com/users
  // app.use('/identifiers', createIdentifierRoute(identifierRepo));

  return app;
};

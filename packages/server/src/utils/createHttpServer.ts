import { resolve } from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import type { JWK } from 'oidc-provider';
import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import vhost from 'vhost';
import {
  createAccountRoute,
  createTenantRoute,
  createUserRoute,
  createActionsRouter,
  createAgentRouter,
} from '../controllers';
import { Accounts, Tenant, Users } from '../entities';
import { createTenantManager } from './createTenantManager';
import { genJwks } from './genJwks';

export const createHttpServer: (option: {
  commonConnectionOptions?: ConnectionOptions;
  envVariables?: any;
  baseUrl?: string;
}) => Promise<{ app: Express; commonConnections: Connection }> = async ({
  commonConnectionOptions,
  envVariables,
  baseUrl,
}) => {
  let commonConnections: Connection;
  let jwks: { keys: JWK[] };

  try {
    // Connect common connection
    commonConnections = await createConnection(commonConnectionOptions);
  } catch (e) {
    console.error('Fail to create common connection');
    console.error(e);
    process.exit(1);
  }

  try {
    jwks = await genJwks(envVariables.OIDC_JWKS_PRIVATE_KEY_FILE);
  } catch (e) {
    console.error('Fail to read private key');
    console.error(e);
    process.exit(1);
  }

  const tenantManager = createTenantManager(commonConnections, jwks);

  try {
    // Connect all pre-existing tenants
    await tenantManager.connectAllDatabases();
  } catch (e) {
    console.error('Fail to create tenant connections');
    console.error(e);
    process.exit(1);
  }

  try {
    // setup agents
    await tenantManager.setupAgents();
  } catch (e) {
    console.error('Fail to setup agents');
    console.error(e);
    process.exit(1);
  }
  const tenantRepo = getConnection('default').getRepository(Tenant);
  const usersRepo = getConnection('default').getRepository(Users);
  const accountsRepo = getConnection('default').getRepository(Accounts);
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', resolve(__dirname, '..', '..', 'views'));
  app.use(json());
  app.use(cookieParser());
  app.use(urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(helmet());
  baseUrl && app.use(cors({ origin: baseUrl }));
  app.use(vhost('*.*.*', createAgentRouter(commonConnections, tenantManager)));
  app.use('/tenants', createTenantRoute(tenantRepo, usersRepo, envVariables));
  app.use('/users', createUserRoute(usersRepo));
  app.use('/accounts', createAccountRoute(accountsRepo));
  app.use('/actions', createActionsRouter(commonConnections, tenantManager));

  // /issuers/did:web:example.com/credentials
  // app.use('/issuers', createIssuerRoute(credentialRepo));

  // /identifiers/did:web:example.com/users
  // app.use('/identifiers', createIdentifierRoute(identifierRepo));

  return { app, commonConnections };
};

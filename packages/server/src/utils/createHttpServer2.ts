import { AgentRouter, ApiSchemaRouter, RequestWithAgentRouter } from '@veramo/remote-server';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ConnectionOptions, createConnection } from 'typeorm';
import { setupVeramo, TTAgent } from './setupVeramo';
import { WebDidDocRouter } from './webDidRouter';

export const createHttpServer2: (option: {
  connectionOptions: ConnectionOptions;
  baseUrl?: string;
}) => Promise<Express> = async ({ connectionOptions, baseUrl }) => {
  let agent: TTAgent;

  try {
    agent = setupVeramo(createConnection(connectionOptions));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  const exposedMethods = agent.availableMethods();
  const agentRouter = AgentRouter({ exposedMethods });
  const schemaRouter = ApiSchemaRouter({ exposedMethods, basePath: '/open-api.json' });
  const requestWithAgentRouter = RequestWithAgentRouter({ agent });
  const didDocRouter = WebDidDocRouter();
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(helmet());
  baseUrl && app.use(cors({ origin: baseUrl }));

  app.use(requestWithAgentRouter);
  app.use('/agent', agentRouter);
  app.use('/open-api.json', schemaRouter);
  app.use(didDocRouter);

  // Todo
  // https://learn.mattr.global/api-ref#operation/wellKnownDidConfig
  return app;
};

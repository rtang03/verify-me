import path from 'path';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import helmet from 'helmet';
import Status from 'http-status';
import morgan from 'morgan';
import { ConnectionOptions, createConnection, MongoEntityManager } from 'typeorm';
import { createDidRoute } from '../controllers';

export const createHttpServer: (option: {
  connectionOptions: ConnectionOptions;
}) => Promise<Express> = async ({ connectionOptions }) => {
  let mongo: MongoEntityManager;

  try {
    const connection = await createConnection(connectionOptions);
    mongo = connection.mongoManager;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (_, res) => res.status(Status.OK).send({ data: 'hello' }));

  // TODO
  // app.get('/.well-known/did-configuration', (_, res) => res.status(Status.OK).send());

  app.use('/dids', createDidRoute(mongo));

  return app;
};

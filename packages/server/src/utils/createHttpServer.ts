import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import helmet from 'helmet';
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
  app.use(morgan('combined'));
  app.use(helmet());

  app.get('/', (_, res) => {
    res.status(200).send({ data: 'hello' });
  });

  app.use('/dids', createDidRoute(mongo));

  return app;
};

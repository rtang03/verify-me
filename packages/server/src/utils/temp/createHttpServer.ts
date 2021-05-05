// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import express, { Express } from 'express';
// import helmet from 'helmet';
// import Status from 'http-status';
// import morgan from 'morgan';
// import { ConnectionOptions, createConnection, MongoEntityManager } from 'typeorm';
// import { createDidRoute } from '../controllers';
// import { didConfig } from '../public/did-configuration';
//
// export const createHttpServer: (option: {
//   connectionOptions: ConnectionOptions;
//   baseUrl?: string;
// }) => Promise<Express> = async ({ connectionOptions, baseUrl }) => {
//   let mongo: MongoEntityManager;
//
//   try {
//     const connection = await createConnection(connectionOptions);
//     mongo = connection.mongoManager;
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   }
//   const app = express();
//
//   app.use(express.json());
//   app.use(cookieParser());
//   app.use(express.urlencoded({ extended: true }));
//   app.use(morgan('dev'));
//   app.use(helmet());
//   baseUrl && app.use(cors({ origin: baseUrl }));
//
//   app.get('/', (_, res) => res.status(Status.OK).send({ data: 'hello' }));
//
//   // https://learn.mattr.global/api-ref#operation/wellKnownDidConfig
//   // WARNING: Not know when it should be used
//   app.get('/.well-known/did-configuration', (_, res) => res.status(Status.OK).json(didConfig));
//
//   app.use('/dids', createDidRoute(mongo));
//
//   return app;
// };

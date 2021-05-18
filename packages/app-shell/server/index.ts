require('dotenv').config();
import http from 'http';
import util from 'util';
import { Accounts, Sessions, Tenant, Users } from '@verify/server';
import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import next from 'next';
import { default as NextAuth } from 'next-auth';
import { createConnection, ConnectionOptions, Connection } from 'typeorm';
import { nextauthOptions } from '../utils';
import { userRoute } from './routes';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const port = parseInt(process.env.PORT || '3000', 10);
const authUrl = '/api/auth/';
const DB_HOST = process.env.TYPEORM_HOST;
const DB_USERNAME = process.env.TYPEORM_USERNAME;
const DB_PASSWORD = process.env.TYPEORM_PASSWORD;
const DB_NAME = process.env.TYPEORM_DATABASE;
const DB_PORT = parseInt(process.env.TYPEORM_PORT || '5432', 10);
const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: true,
  entities: [Accounts, Sessions, Users, Tenant],
};

app
  .prepare()
  .then(async () => {
    let connection: Connection;

    try {
      connection = await createConnection(connectionOptions);
    } catch (e) {
      console.error(e);
      throw new Error('fail to connect');
    }
    const accountRepo = connection.getRepository<Accounts>('Accounts');
    const userRepo = connection.getRepository<Users>('Users');
    const tenantRepo = connection.getRepository<Tenant>('Tenant');

    const server = express();
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(cookieParser());
    server.use(morgan('dev'));
    // server.use(cors());

    server.use('/api/protected', userRoute(userRepo, accountRepo, tenantRepo));

    // NOTE: using next-auth in custom Express server
    // @see https://github.com/nextauthjs/next-auth/issues/531
    server.use((req, res, next) => {
      if (!req.url.startsWith(authUrl)) return next();

      req.query.nextauth = req.url // start with request url
        .slice(authUrl.length) // make relative to baseUrl
        .replace(/\?.*/, '') // remove query part, use only path part
        .split('/'); // as array of strings

      NextAuth(
        req as any,
        res as any,
        nextauthOptions({
          type: 'postgres',
          host: DB_HOST,
          port: DB_PORT,
          username: DB_USERNAME,
          password: DB_PASSWORD,
          database: DB_NAME,
          synchronize: false,
          logging: true,
        })
      );
    });

    server.use((req, res) => app.getRequestHandler()(req, res));

    http.createServer(server).listen(port, () => {
      console.log(`server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(util.format('❌  fail to start nextjs server, %j', error));
    process.exit(1);
  });

require('dotenv').config();
import http from 'http';
import util from 'util';
import { Accounts, Sessions, Users } from '@verify/server';
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
const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'docker',
  database: 'auth_db',
  synchronize: false,
  logging: true,
  entities: [Accounts, Sessions, Users],
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

    const server = express();
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(cookieParser());
    server.use(morgan('dev'));
    // server.use(cors());

    server.use('/api/protected', userRoute(userRepo, accountRepo));

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
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'docker',
          database: 'auth_db',
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

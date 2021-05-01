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
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);
const authUrl = '/api/auth/';
const connectionOptions: ConnectionOptions = {
  type: 'mongodb',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT as any, 10),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  logging: true,
  entities: [Accounts, Sessions, Users],
  useUnifiedTopology: true,
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
      NextAuth(req as any, res as any, nextauthOptions(connectionOptions));
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

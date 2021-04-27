import { userRoute } from './routes';

require('dotenv').config();
import http from 'http';
import util from 'util';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import express from 'express';
import morgan from 'morgan';
import next from 'next';
import { default as NextAuth } from 'next-auth';
import { createConnection, ConnectionOptions, Connection } from 'typeorm';
import {
  Account,
  User,
  TypoOrmAccountSchema as AccountSchema,
  TypeOrmUserSchema as UserSchema,
} from '../models';
import { nextauthOptions } from '../utils';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);
const authUrl = '/api/auth/';
const psqlOptions: ConnectionOptions = {
  name: 'default',
  type: 'postgres' as any,
  host: process.env.DATABASE_HOST || 'localhost',
  port: 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  logging: process.env.TYPEORM_LOGGING === 'true',
  synchronize: false,
  dropSchema: false,
  entities: [UserSchema, AccountSchema],
  connectTimeoutMS: 10000,
};

app
  .prepare()
  .then(async () => {
    let connection: Connection;

    try {
      connection = await createConnection(psqlOptions);
    } catch (e) {
      console.error(e);
      throw new Error('fail to connect');
    }
    const accountRepo = connection.getRepository<Account>('Account');
    const userRepo = connection.getRepository<User>('User');

    const server = express();
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(cookieParser());
    server.use(morgan('dev'));
    server.use(errorHandler());

    server.use('/api/protected', userRoute(userRepo, accountRepo));

    // NOTE: using next-auth in custom Express server
    // @see https://github.com/nextauthjs/next-auth/issues/531
    server.use((req, res, next) => {
      if (!req.url.startsWith(authUrl)) return next();

      req.query.nextauth = req.url // start with request url
        .slice(authUrl.length) // make relative to baseUrl
        .replace(/\?.*/, '') // remove query part, use only path part
        .split('/'); // as array of strings
      NextAuth(req as any, res as any, nextauthOptions);
    });

    server.get('*', (req, res) => handle(req, res));

    http.createServer(server).listen(port, () => {
      console.log(`server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(util.format('❌  fail to start nextjs server, %j', error));
    process.exit(1);
  });

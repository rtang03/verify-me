require('dotenv').config();
import fs from 'fs';
import http from 'http';
import https from 'https';
import util from 'util';
import { Express } from 'express';
import type { ConnectionOptions } from 'typeorm';
import { Accounts, Sessions, Tenant, Users } from './entities';
import { createHttpServer } from './utils';

const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3002,
  SPORT: parseInt(process.env.SPORT, 10) || 3002,
  DB_HOST: process.env.TYPEORM_HOST,
  DB_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  DB_USERNAME: process.env.TYPEORM_USERNAME,
  DB_PASSWORD: process.env.TYPEORM_PASSWORD,
  DB_NAME: process.env.TYPEORM_DATABASE,
  OIDC_JWKS_PRIVATE_KEY_FILE: process.env.OIDC_JWKS_PRIVATE_KEY_FILE,
};

const commonConnectionOptions: ConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: ENV_VAR.DB_HOST,
  port: ENV_VAR.DB_PORT,
  username: ENV_VAR.DB_USERNAME,
  password: ENV_VAR.DB_PASSWORD,
  database: ENV_VAR.DB_NAME,
  synchronize: true,
  logging: true,
  schema: 'public',
  entities: [Tenant, Accounts, Sessions, Users],
};

(async () => {
  let server: Express;
  console.log('====Starting REST Server====');
  // All env var are required
  Object.entries<string | number>(ENV_VAR).forEach(([key, value]) => {
    if (value === undefined) {
      const error = `environment variable is missing ${key}`;
      console.error(error);
      throw new Error(error);
    }
  });

  // safety measure: catch all uncaughtException
  process.on('uncaughtException', (err) => {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
  });

  try {
    const { app } = await createHttpServer({
      commonConnectionOptions,
      envVariables: ENV_VAR,
    });
    server = app;
  } catch (error) {
    console.error(util.format('❌  An error occurred while createHttpserver: %j', error));
    process.exit(1);
  }

  const options = {
    key: fs.readFileSync('certs/host.key'),
    cert: fs.readFileSync('certs/host.pem'),
  };

  // https redirect
  https.createServer(options, server).listen(ENV_VAR.SPORT, () => {
    console.log(`🚀  rest server started at port: https://${ENV_VAR.HOST}:${ENV_VAR.SPORT}`);
  });

  http
    .createServer((req, res) => {
      res.writeHead(301, { Location: 'https://' + req.headers['host'] + req.url });
      res.end();
    })
    .listen(ENV_VAR.PORT, () => {
      console.log(`🚀  rest server started at port: http://${ENV_VAR.HOST}:${ENV_VAR.PORT}`);
    });
})().catch((error) => {
  console.error(util.format('❌  fail to start app.js, %j', error));
  process.exit(1);
});

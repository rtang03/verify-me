require('dotenv').config();
import http from 'http';
import util from 'util';
import { Entities } from '@veramo/data-store';
import type { ConnectionOptions } from 'typeorm';
import { createHttpServer2 } from './utils';

const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3002,
  TYPEORM_HOST: process.env.TYPEORM_HOST,
  TYPEORM_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  TYPEORM_USERNAME: process.env.TYPEORM_USERNAME,
  TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD,
  DATABASE: process.env.DATABASE,
};
const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'docker',
  database: 'auth_db',
  synchronize: true,
  logging: true,
  entities: Entities,
};

(async () => {
  let server;
  console.log('====Starting REST Server 2====');

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
    server = await createHttpServer2({ connectionOptions });
  } catch (error) {
    console.error(util.format('❌  An error occurred while createAuthServer: %j', error));
    process.exit(1);
  }

  http.createServer(server).listen(ENV_VAR.PORT, () => {
    console.log(`🚀  rest server started at port: http://${ENV_VAR.HOST}:${ENV_VAR.PORT}`);
  });
})().catch((error) => {
  console.error(util.format('❌  fail to start app.js, %j', error));
  process.exit(1);
});

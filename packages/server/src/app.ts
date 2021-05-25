require('dotenv').config();
import http from 'http';
import util from 'util';
import type { ConnectionOptions } from 'typeorm';
import { Accounts } from './entities/Accounts';
import { Sessions } from './entities/Sessions';
import { Tenant } from './entities/Tenant';
import { Users } from './entities/Users';
import { createHttpServer } from './utils';

const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3002,
  DB_HOST: process.env.TYPEORM_HOST,
  DB_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  DB_USERNAME: process.env.TYPEORM_USERNAME,
  DB_PASSWORD: process.env.TYPEORM_PASSWORD,
  DB_NAME: process.env.TYPEORM_DATABASE,
};
// const connectionOptions: ConnectionOptions = {
//   name: 'default',
//   type: 'postgres',
//   host: ENV_VAR.HOST,
//   port: ENV_VAR.PORT,
//   username: ENV_VAR.DB_USERNAME,
//   password: ENV_VAR.DB_PASSWORD,
//   database: ENV_VAR.DB_NAME,
//   synchronize: false,
//   logging: true,
//   schema: 'public',
//   entities: Entities,
// };

const commonConnectionOptions: ConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: ENV_VAR.DB_HOST,
  port: ENV_VAR.DB_PORT,
  username: ENV_VAR.DB_USERNAME,
  password: ENV_VAR.DB_PASSWORD,
  database: ENV_VAR.DB_NAME,
  synchronize: false,
  logging: true,
  schema: 'public',
  entities: [Tenant, Accounts, Sessions, Users],
};

(async () => {
  let server;
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
    server = await createHttpServer({
      commonConnectionOptions,
      envVariables: ENV_VAR,
    });
  } catch (error) {
    console.error(util.format('❌  An error occurred while createHttpserver: %j', error));
    process.exit(1);
  }

  http.createServer(server).listen(ENV_VAR.PORT, () => {
    console.log(`🚀  rest server started at port: http://${ENV_VAR.HOST}:${ENV_VAR.PORT}`);
  });
})().catch((error) => {
  console.error(util.format('❌  fail to start app.js, %j', error));
  process.exit(1);
});

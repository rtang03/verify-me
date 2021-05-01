require('dotenv').config();
import http from 'http';
import util from 'util';
import type { ConnectionOptions } from 'typeorm';
import { DidDocument } from './entities/DidDocument';
import { createHttpServer } from './utils';

const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3001,
  TYPEORM_HOST: process.env.TYPEORM_HOST,
  TYPEORM_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  TYPEORM_USERNAME: process.env.TYPEORM_USERNAME,
  TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD,
  DATABASE: process.env.DATABASE,
};
const connectionOptions: ConnectionOptions = {
  type: 'mongodb',
  host: ENV_VAR.TYPEORM_HOST,
  port: ENV_VAR.TYPEORM_PORT,
  username: ENV_VAR.TYPEORM_USERNAME,
  password: ENV_VAR.TYPEORM_PASSWORD,
  database: ENV_VAR.DATABASE,
  synchronize: false,
  logging: true,
  entities: [DidDocument],
  useUnifiedTopology: true,
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
    server = await createHttpServer({ connectionOptions });
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

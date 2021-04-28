require('dotenv').config();
import http from 'http';
import util from 'util';
import { ConnectionOptions } from 'typeorm';
import { createHttpServer } from './utils';

const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3001,
};

const connectionOptions: ConnectionOptions = {
  database: '',
  type: 'mongodb',
};

(async () => {
  let server;
  console.log('====Starting REST Server====');

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

  http.createServer(server).listen(ENV_VAR.HOST, ENV_VAR.PORT, () => {
    console.log(`🚀  rest server started at port: http://${ENV_VAR.HOST}:${ENV_VAR.PORT}`);
  });
})().catch((error) => {
  console.error(util.format('❌  fail to start app.js, %j', error));
  process.exit(1);
});

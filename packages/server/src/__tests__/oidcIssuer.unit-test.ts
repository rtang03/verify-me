require('dotenv').config({ path: './.env.test' });
import { Express } from 'express';
import request from 'supertest';
import { ConnectionOptions, getRepository } from 'typeorm';
import { Tenant, Users } from '../entities';
import { createHttpServer } from '../utils';

const slug = `tenant_${Math.floor(Math.random() * 1000)}`;
const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3002,
  DB_HOST: process.env.TYPEORM_HOST,
  DB_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  DB_USERNAME: process.env.TYPEORM_USERNAME,
  DB_PASSWORD: process.env.TYPEORM_PASSWORD,
  DB_NAME: process.env.TYPEORM_DATABASE,
};
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
  entities: [Tenant, Users],
};

let app: Express;
let user: Users;
let tenant: Tenant;

beforeAll(async () => {
  try {
    app = await createHttpServer({ commonConnectionOptions, envVariables: ENV_VAR });

    const _user = new Users();
    _user.name = `tenant-tester_${Math.floor(Math.random() * 1000)}`;
    _user.email = `${_user.name}@example.com`;
    user = await getRepository(Users).save(_user);

    if (!app) {
      console.error('🚫  app is undefined');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

afterAll(async () => {
  await getRepository(Users).delete(user.id);
  return new Promise<void>((ok) => setTimeout(() => ok(), 2000));
});

describe('Oidc Issuer Tests', () => {
  it('should GET /oidc/.well-known/openid-configuration', async () => {
    return true;
  });

  it('should POST /oidc/issuers', async () => {
    return true;
  });
});
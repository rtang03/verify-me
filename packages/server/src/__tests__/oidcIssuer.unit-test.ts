require('dotenv').config({ path: './.env.test' });
import { Express } from 'express';
import request from 'supertest';
import { Connection, ConnectionOptions, getRepository } from 'typeorm';
import { Accounts, Sessions, Tenant, Users } from '../entities';
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
  synchronize: false,
  logging: true,
  entities: [Tenant, Accounts, Users, Sessions],
};

let express: Express;
let conn: Connection;
let user: Users;
let tenant: Tenant;

beforeAll(async () => {
  try {
    const { app, commonConnections } = await createHttpServer({
      commonConnectionOptions,
      envVariables: ENV_VAR,
    });
    express = app;
    conn = commonConnections;

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
  await conn.close();
  return new Promise<void>((ok) => setTimeout(() => ok(), 500));
});

describe('Oidc Issuer Tests', () => {
  it('should fail to GET openid-configuration, invalid issuer', async () =>
    request(express)
      .get(`/oidc/issuers/123123/.well-known/openid-configuration`)
      .set('host', 'issuer.example.com')
      .expect(({ body }) => {
        console.log(body);
      }));

  it('should GET /oidc/.well-known/openid-configuration', async () =>
    request(express)
      .get(`/oidc/issuers/123123/.well-known/openid-configuration`)
      .set('host', 'issuer.example.com')
      .set('X-Forwarded-Proto', 'https')
      .expect(({ body }) => expect(body.subject_types_supported).toEqual(['public'])));

  it('should POST /oidc/issuers', async () => {
    return true;
  });
});

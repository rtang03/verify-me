require('dotenv').config({ path: './.env.test' });
import { Express } from 'express';
import request from 'supertest';
import type { ConnectionOptions } from 'typeorm';
import { getRepository } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { Users } from '../entities/Users';
import { createHttpServer, isTenant } from '../utils';

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
const commonConnectionOptions: ConnectionOptions[] = [
  {
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
  },
];

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

const testOne = (body, error) => {
  expect(body.status).toEqual('OK');
  expect(body.data.items[0].slug).toEqual(slug);
  expect(body.data.items[0].user_id).toEqual(user.id);
  expect(error).toBeFalsy();
  expect(isTenant(body.data.items[0])).toBeTruthy();
};

describe('Tenant unit test', () => {
  // const body = {
  //   status: 'OK',
  //   data: {
  //     slug: 'tenant_886',
  //     user_id: 1,
  //     db_name: 'auth_db',
  //     db_host: '0.0.0.0',
  //     db_port: 5432,
  //     db_username: 'postgres',
  //     db_password: 'docker',
  //     name: null,
  //     members: null,
  //     id: 1,
  //     created_at: '2021-05-18T05:53:20.074Z',
  //     updated_at: '2021-05-18T05:53:20.074Z',
  //   },
  // };
  it('should POST tenant', async () =>
    request(app)
      .post('/tenants')
      .set('authorization', `Bearer`)
      .send({ slug, user_id: user.id })
      .expect(({ body, error }) => {
        expect(body.status).toEqual('OK');
        expect(body.data.slug).toEqual(slug);
        expect(body.data.user_id).toEqual(user.id);
        expect(isTenant(body.data)).toBeTruthy();
        expect(error).toBeFalsy();
        tenant = body.data;
      }));

  it('should GET tenant', async () =>
    request(app)
      .get(`/tenants/${tenant.id}`)
      .set('authorization', `Bearer`)
      .expect(({ body, error }) => testOne(body, error)));

  it('should GET all tenant', async () =>
    request(app)
      .get(`/tenants`)
      .set('authorization', `Bearer`)
      .expect(({ body, error }) => {
        expect(body.status).toEqual('OK');
        expect(error).toBeFalsy();
        body.data.items.forEach((item) => expect(isTenant(item)).toBeTruthy());
      }));

  it('should GET some tenants, by email', async () =>
    request(app)
      .get(`/tenants?email=${user.email}`)
      .set('authorization', `Bearer`)
      .expect(({ body, error }) => testOne(body, error)));

  it('should PUT tenant', async () =>
    request(app)
      .put(`/tenants/${tenant.id}`)
      .set('authorization', `Bearer`)
      .send({ name: 'tester' })
      .expect(({ body, error }) => {
        expect(body.status).toEqual('OK');
        expect(body.data).toEqual({ generatedMaps: [], raw: [], affected: 1 });
        expect(error).toBeFalsy();
      }));

  it('should GET, by user_id, with updated tenant name', async () =>
    request(app)
      .get(`/tenants?user_id=${user.id}`)
      .set('authorization', `Bearer`)
      .expect(({ body, error }) => {
        testOne(body, error);
        expect(body.data.items[0].name).toEqual('tester');
      }));

  it('should DELETE tenant', async () =>
    request(app)
      .delete(`/tenants/${tenant.id}`)
      .set('authorization', `Bearer`)
      .expect(({ body, error }) => {
        expect(body.status).toEqual('OK');
        expect(body.data).toEqual({ raw: [], affected: 1 });
        expect(error).toBeFalsy();
      }));
});

require('dotenv').config({ path: './.env' });
import { Express } from 'express';
import Status from 'http-status';
import request from 'supertest';
import { Connection, ConnectionOptions, getRepository } from 'typeorm';
import { Accounts, Sessions, Tenant, Users } from '../entities';
import type { CommonResponse, CreateOidcIssuerArgs, Paginated, TenantManager } from '../types';
import { createHttpServer, isTenant } from '../utils';

const slug = `tenant_${~~(Math.random() * 1000)}`;
const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3002,
  DB_HOST: process.env.TYPEORM_HOST,
  DB_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  DB_USERNAME: process.env.TYPEORM_USERNAME,
  DB_PASSWORD: process.env.TYPEORM_PASSWORD,
  DB_NAME: process.env.TYPEORM_DATABASE,
  OIDC_JWKS_PRIVATE_KEY_FILE: process.env.OIDC_JWKS_PRIVATE_KEY_FILE,
  AUTH0_CLIENT_ID: process.env.AUTH0_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_SECRET,
};
const commonConnectionOptions: ConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: ENV_VAR.DB_HOST,
  port: ENV_VAR.DB_PORT,
  username: ENV_VAR.DB_USERNAME,
  password: ENV_VAR.DB_PASSWORD,
  database: ENV_VAR.DB_NAME,
  // must be non-synchronous; the dev-net is bootstraped with init-script
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
    const { app, commonConnections, tenantManager } = await createHttpServer({
      commonConnectionOptions,
      envVariables: ENV_VAR,
    });
    express = app;
    conn = commonConnections;

    const _user = new Users();
    _user.name = `tenant-tester_${~~(Math.random() * 1000)}`;
    _user.email = `${_user.name}@example.com`;
    user = await getRepository(Users).save(_user);

    // retrieve "issuer" tenant
    const tenantRepo = await getRepository(Tenant);
    const tenant = await tenantRepo.findOne({ where: { slug: 'issuer' } });

    if (tenant) {
      // deactivate will not remove schema
      const isDeactivated = await tenantManager.deactivate(tenant.id);
      console.log(`Deactivted: ${isDeactivated}`);

      // remove pre-existing "issuer" tenant

      const result = await tenantRepo.delete(tenant.id);
      result?.affected === 1 && console.log('one record deleted.');

      // TODO: BUG: remove 'issuer' related schema
      // await getConnection('default').query(
      //   `DROP SCHEMA IF EXISTS ${getSchemaName(tenant.id)} CASCADE`
      // );
    }

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
  // await getRepository(Users).delete(user.id);
  await conn.close();
  return new Promise<void>((ok) => setTimeout(() => ok(), 5000));
});

describe('Oidc Issuer Tests', () => {
  /**
   * Part 1: Tenants tests
   */
  it('should fail to GET /is_agent_exist', async () =>
    request(express)
      .get('/is_agent_exist')
      .set('host', 'issuer.example.com')
      .expect(({ body }) => expect(body).toEqual({ data: 'Agent not found' })));

  // it('should fail to create new tenant: missing user_id', async () =>
  //   request(express)
  //     .post('/tenants')
  //     .set('host', 'example.com')
  //     .set('authorization', `Bearer`)
  //     .send({ slug: 'issuer' })
  //     .expect(({ body, status }) => {
  //       expect(body).toEqual({ status: 'ERROR', error: 'missing user_id' });
  //       expect(status).toEqual(Status.BAD_REQUEST);
  //     }));

  // it('should fail to create tenant, reserved word not allowed', async () =>
  //   request(express)
  //     .post(`/tenants`)
  //     .set('host', 'example.com')
  //     .set('authorization', `Bearer`)
  //     .send({ slug: 'default', user_id: user.id })
  //     .expect(({ body, status }) => {
  //       expect(body).toEqual({ status: 'ERROR', error: '"default" is reserved' });
  //       expect(status).toEqual(Status.BAD_REQUEST);
  //     }));

  // it('should fail to create tenant, user_id not found', async () =>
  //   request(express)
  //     .post(`/tenants`)
  //     .set('host', 'example.com')
  //     .set('authorization', `Bearer`)
  //     .send({ slug: 'abcdef', user_id: '0ac6d292-1868-44d3-a161-923052e11fb8' })
  //     .expect(({ body, status }) => {
  //       expect(body).toEqual({ status: 'ERROR', error: 'user_id not found' });
  //       expect(status).toEqual(Status.BAD_REQUEST);
  //     }));

  // it('should fail to create tenant, invalid uuid', async () =>
  //   request(express)
  //     .post(`/tenants`)
  //     .set('host', 'example.com')
  //     .set('authorization', `Bearer`)
  //     .send({ slug: 'defgh', user_id: '123123' })
  //     .expect(({ body, status }) => {
  //       expect(body?.message).toContain('invalid input syntax for uuid');
  //       expect(status).toEqual(Status.BAD_REQUEST);
  //     }));

  it('should POST /tenants', async () =>
    request(express)
      .post(`/tenants`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ slug: 'issuer', user_id: user.id })
      .expect(({ body, status }) => {
        expect(isTenant(body?.data)).toBeTruthy();
        expect(body?.status).toEqual('OK');
        expect(status).toEqual(Status.CREATED);
      }));

  // TODO: Bug here. Parameter tampering with query parameter "user_id".
  // The query parameter "user_id" should be replaced user revealed by bearer token
  it('should GET /tenants', async () =>
    request(express)
      .get(`/tenants?user_id=${user.id}`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }: { body: CommonResponse<Paginated<Tenant>>; status: number }) => {
        tenant = body?.data?.items?.[0];
        expect(isTenant(tenant)).toBeTruthy();
        expect(body?.data?.total).toEqual(1);
        expect(status).toEqual(Status.OK);
      }));

  // it('should fail to POST /actions/:tenantId/activate, invalid tenantId', async () =>
  //   request(express)
  //     .post(`/actions/0ac6d292-1868-44d3-a161-923052e11fb8/activate`)
  //     .set('host', 'example.com')
  //     .set('authorization', `Bearer`)
  //     .expect(async ({ body, status }) => {
  //       expect(body).toEqual({ status: 'ERROR', error: 'tenant not found' });
  //       expect(status).toEqual(Status.BAD_REQUEST);
  //     }));

  it('should POST /actions/:tenantId/activate', async () =>
    request(express)
      .post(`/actions/${tenant.id}/activate`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(async ({ body, status }) => {
        expect(body).toEqual({ status: 'OK', data: true });
        expect(status).toEqual(Status.OK);
      }));

  // Add new test, for repeated "activate"

  it('should GET /actions/tenant_summary, after activation', async () =>
    request(express)
      .get('/actions/tenant_summary')
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data?.agentCount).toEqual(1);
      }));

  // it('should fail to GET /actions/:tenantId/tenant_status, invalid tenantId', async () =>
  //   request(express)
  //     .get(`/actions/0ac6d292-1868-44d3-a161-923052e11fb8/tenant_status`)
  //     .set('host', 'issuer.example.com')
  //     .set('authorization', `Bearer`)
  //     .expect(({ body, status }) => {
  //       expect(body).toEqual({ status: 'ERROR', error: 'tenant not found' });
  //       expect(status).toEqual(Status.BAD_REQUEST);
  //     }));

  it('should GET /actions/:tenantId/tenant_status', async () =>
    request(express)
      .get(`/actions/${tenant.id}/tenant_status`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data).toEqual({ isActivated: true, isSchemaExist: true, isAgentReady: true });
      }));

  it('should GET /is_agent_exist, after activation', async () =>
    request(express)
      .get('/is_agent_exist')
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body }) => expect(body).toEqual({ data: 'Agent found' })));

  /**
   * Part 2: Oidc Issuer tests
   */
  it('wait 5s', async () => new Promise((ok) => setTimeout(() => ok(true), 5000)));

  // IMPORTANT: host is used to determine the tenant
  it('should fail to GET openid-configuration, invalid issuer', async () =>
    request(express)
      .get(`/oidc/issuers/d9721cac-4239-4b1a-a690-d283c66f4e49/.well-known/openid-configuration`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body }) => expect(body?.error).toContain('Invalid issuer id')));

  // it('should POST /oidc/issuers', async () =>
  //   request(express)
  //     .post('/oidc/issuers')
  //     .set('host', 'issuer.example.com')
  //     .set('authorization', `Bearer`)
  //     .send(<CreateOidcIssuerArgs>{
  //       credential: {
  //         issuerDid: 'did:web:issuer.example.com',
  //         name: 'federated_credential',
  //         description: 'unit test',
  //         context: ['https://schema.org'],
  //         type: 'AlumniCredential',
  //       },
  //       federatedProvider: {
  //         url: 'https://dashslab.us.auth0.com',
  //         scope: ['openid', 'profile', 'email'],
  //         clientId: ENV_VAR.AUTH0_CLIENT_ID,
  //         clientSecret: ENV_VAR.AUTH0_CLIENT_SECRET,
  //       },
  //       // TODO: need to revisit all openId claim mappings
  //       claimMappings: [
  //         {
  //           jsonLdTerm: 'userid',
  //           oidcClaim: 'userid',
  //         },
  //       ],
  //     })
  //     .expect(({ body, status }) => {
  //       console.log(body);
  //     }));

  // it('should GET /oidc/.well-known/openid-configuration', async () =>
  //   request(express)
  //     .get(`/oidc/issuers/123123/.well-known/openid-configuration`)
  //     .set('host', 'issuer.example.com')
  //     .set('X-Forwarded-Proto', 'https')
  //     .expect(({ body }) => expect(body.subject_types_supported).toEqual(['public'])));

  // it('should POST /oidc/issuers', async () => {
  //   return true;
  // });

  /**
   * Tear down tests
   */
  it('should POST /actions/:tenantId/deactivate', async () =>
    request(express)
      .post(`/actions/${tenant.id}/deactivate`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data).toBeTruthy();
      }));

  // NOTE: deactivation will NOT drop Schema
  it('should GET /actions/tenant_summary, after deactivation', async () =>
    request(express)
      .get('/actions/tenant_summary')
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data?.agentCount).toEqual(0);
      }));
});

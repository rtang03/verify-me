require('dotenv').config({ path: './.env' });
import { Express } from 'express';
import Status from 'http-status';
import request from 'supertest';
import { Connection, ConnectionOptions, getRepository } from 'typeorm';
import { Accounts, OidcIssuer, Sessions, Tenant, Users } from '../entities';
import type {
  CommonResponse,
  CreateOidcIssuerArgs,
  CreateOidcIssuerClientArgs,
  Paginated,
} from '../types';
import { createHttpServer, isOidcClient, isOidcIssuer, isTenant } from '../utils';

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
const notFoundData = { total: 0, cursor: 0, hasMore: false, items: [] };

let express: Express;
let conn: Connection;
let user: Users;
let tenant: Tenant;
let issuerId: string;
let clientId: string;

beforeAll(async () => {
  try {
    const { app, commonConnections, tenantManager } = await createHttpServer({
      commonConnectionOptions,
      envVariables: ENV_VAR,
    });
    express = app;
    conn = commonConnections;

    const _user = new Users();
    _user.name = `tenant-tester_${~~(Math.random() * 10000)}`;
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
  // OK
  it('should fail to GET /is_agent_exist', async () =>
    request(express)
      .get('/is_agent_exist')
      .set('host', 'issuer.example.com')
      .expect(({ body }) => expect(body).toEqual({ data: 'Agent not found' })));

  // OK
  it('should fail to create new tenant: missing user_id', async () =>
    request(express)
      .post('/tenants')
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ slug: 'issuer' })
      .expect(({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'missing user_id' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  it('should fail to create tenant, reserved word not allowed', async () =>
    request(express)
      .post(`/tenants`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ slug: 'default', user_id: user.id })
      .expect(({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: '"default" is reserved' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  it('should fail to create tenant, user_id not found', async () =>
    request(express)
      .post(`/tenants`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ slug: 'abcdef', user_id: '0ac6d292-1868-44d3-a161-923052e11fb8' })
      .expect(({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'user_id not found' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  it('should fail to create tenant, invalid uuid', async () =>
    request(express)
      .post(`/tenants`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ slug: 'defgh', user_id: '123123' })
      .expect(({ body, status }) => {
        expect(body?.message).toContain('invalid input syntax for uuid');
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

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
        tenant = body?.data;
      }));

  // TODO: Bug here. Parameter tampering with query parameter "user_id".
  // The query parameter "user_id" should be replaced user revealed by bearer token
  // OK
  it('should GET /tenants', async () =>
    request(express)
      .get(`/tenants?user_id=${user.id}`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }: { body: CommonResponse<Paginated<Tenant>>; status: number }) => {
        expect(isTenant(tenant)).toBeTruthy();
        expect(body?.data?.total).toEqual(1);
        expect(status).toEqual(Status.OK);
      }));

  // OK
  it('should GET /tenants/:tenantId, NOT FOUND', async () =>
    request(express)
      .get(`/tenants/0ac6d292-1868-44d3-a161-923052e11fb8`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }: { body: CommonResponse<Paginated<Tenant>>; status: number }) => {
        expect(body?.data?.total).toEqual(0);
        expect(status).toEqual(Status.NOT_FOUND);
      }));

  // OK
  it('should GET /tenants/:tenantId', async () =>
    request(express)
      .get(`/tenants/${tenant.id}`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }: { body: CommonResponse<Paginated<Tenant>>; status: number }) => {
        tenant = body?.data?.items?.[0];
        expect(isTenant(tenant)).toBeTruthy();
        expect(body?.data?.total).toEqual(1);
        expect(status).toEqual(Status.OK);
      }));

  // OK
  it('should PUT /tenants/:tenantId', async () =>
    request(express)
      .put(`/tenants/${tenant.id}`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ name: 'my_new_name' })
      .expect(({ body, status }) => {
        expect(body?.data?.affected).toEqual(1);
        expect(status).toEqual(Status.OK);
      }));

  // OK
  it('should fail to POST /actions/:tenantId/activate, invalid tenantId', async () =>
    request(express)
      .post(`/actions/0ac6d292-1868-44d3-a161-923052e11fb8/activate`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(async ({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'tenant not found' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  it('wait 2s', async () => new Promise((ok) => setTimeout(() => ok(true), 2000)));

  it('should POST /actions/:tenantId/activate', async () =>
    request(express)
      .post(`/actions/${tenant.id}/activate`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(async ({ body, status }) => {
        expect(body).toEqual({ status: 'OK', data: true });
        expect(status).toEqual(Status.OK);
      }));

  // OK
  it('should fail to repeatedly POST /actions/:tenantId/activate', async () =>
    request(express)
      .post(`/actions/${tenant.id}/activate`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(async ({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'fail to activate; tenant already exist.' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  // OK
  it('should GET /actions/tenant_summary, after activation', async () =>
    request(express)
      .get('/actions/tenant_summary')
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data?.agentCount).toEqual(1);
      }));

  // OK
  it('should fail to GET /actions/:tenantId/tenant_status, invalid tenantId', async () =>
    request(express)
      .get(`/actions/0ac6d292-1868-44d3-a161-923052e11fb8/tenant_status`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'tenant not found' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  // OK
  it('should GET /actions/:tenantId/tenant_status', async () =>
    request(express)
      .get(`/actions/${tenant.id}/tenant_status`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data).toEqual({ isActivated: true, isSchemaExist: true, isAgentReady: true });
      }));

  // OK
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

  // OK
  it('should fail to POST /oidc/issuers, invalid argument', async () =>
    request(express)
      .post('/oidc/issuers')
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .send(<CreateOidcIssuerArgs>{
        credential: null,
        federatedProvider: null,
        claimMappings: null,
      })
      .expect(({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'invalid argument' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  it('should POST /oidc/issuers', async () =>
    request(express)
      .post('/oidc/issuers')
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .send(<CreateOidcIssuerArgs>{
        credential: {
          issuerDid: 'did:web:issuer.example.com',
          name: 'federated_credential',
          description: 'unit test',
          context: ['https://schema.org'],
          type: 'AlumniCredential',
        },
        federatedProvider: {
          url: 'https://dashslab.us.auth0.com',
          scope: ['openid', 'profile', 'email'],
          clientId: ENV_VAR.AUTH0_CLIENT_ID,
          clientSecret: ENV_VAR.AUTH0_CLIENT_SECRET,
        },
        // TODO: need to revisit all openId claim mappings
        claimMappings: [
          {
            jsonLdTerm: 'userid',
            oidcClaim: 'userid',
          },
        ],
      })
      .expect(({ body, status }) => {
        expect(isOidcIssuer(body?.data)).toBeTruthy();
        expect(status).toEqual(Status.CREATED);
        issuerId = body?.data?.id;
      }));

  // OK
  it('should fail to GET /oidc/.well-known/openid-configuration', async () =>
    request(express)
      .get(`/oidc/issuers/123123/.well-known/openid-configuration`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      // .set('X-Forwarded-Proto', 'https')
      .expect(({ body, status }) => {
        expect(body?.error).toContain('invalid input syntax for uuid');
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  // OK
  it('should GET /oidc/issuers/:id/.well-known/openid-configuration', async () =>
    request(express)
      .get(`/oidc/issuers/${issuerId}/.well-known/openid-configuration`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      // handle this warning
      // oidc-provider WARNING: x-forwarded-proto header not detected for an https issuer, you must configure your ssl offloading proxy and the provider
      .set('X-Forwarded-Proto', 'https')
      .expect(({ body, status }) => {
        expect(body.subject_types_supported).toEqual(['public']);
        expect(status).toEqual(Status.OK);
      }));

  // OK
  it('should fail to GET /oidc/issuers/:id, invalid input', async () =>
    request(express)
      .get(`/oidc/issuers/123123`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.message).toContain('invalid input syntax for uuid');
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  // OK
  it('should GET /oidc/issuers/:id, non-existing', async () =>
    request(express)
      .get(`/oidc/issuers/0ac6d292-1868-44d3-a161-923052e11fb8`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.data).toEqual(notFoundData);
        expect(status).toEqual(Status.NOT_FOUND);
      }));

  // OK
  it('should GET /oidc/issuers/:id', async () =>
    request(express)
      .get(`/oidc/issuers/${issuerId}`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(
        ({ body, status }: { body: CommonResponse<Paginated<OidcIssuer>>; status: number }) => {
          expect(isOidcIssuer(body?.data?.items?.[0])).toBeTruthy();
          expect(status).toEqual(Status.OK);
        }
      ));

  // TODO: Placeholder. Not well implementated yet
  // it('should PUT /oidc/issuers/:id', async () =>
  //   request(express)
  //     .put(`/oidc/issuers/${issuerId}`)
  //     .set('host', 'issuer.example.com')
  //     .set('authorization', `Bearer`)
  //     .expect(({ body }) => {
  //       console.log(body);
  //     }));

  /**
   * Part 3: Oidc Client tests
   */
  it('should fail to register oidc client, missing client_name', async () =>
    request(express)
      .post(`/oidc/issuers/${issuerId}/reg`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .send(<CreateOidcIssuerClientArgs>{
        redirect_uris: ['https://jwt.io'],
        response_types: ['id_token'],
        grant_types: ['implicit'],
        token_endpoint_auth_method: 'client_secret_post',
        id_token_signed_response_alg: 'ES256',
        application_type: 'web',
      })
      .expect(({ body, status }) => {
        expect(body).toEqual({ status: 'ERROR', error: 'invalid argument' });
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  // OK
  it('should register oidc client', async () =>
    request(express)
      .post(`/oidc/issuers/${issuerId}/reg`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .send(<CreateOidcIssuerClientArgs>{
        client_name: 'Oidc client for wallet',
        redirect_uris: ['https://jwt.io'],
        response_types: ['id_token'],
        grant_types: ['implicit'],
        token_endpoint_auth_method: 'client_secret_post',
        id_token_signed_response_alg: 'ES256',
        application_type: 'web',
      })
      .expect(({ body, status }) => {
        expect(isOidcClient(body?.data)).toBeTruthy();
        expect(status).toEqual(Status.CREATED);
        clientId = body?.data?.client_id;
      }));

  // OK
  it('should fail to GET /oidc/issuers/:issuerId/clients/:id, invalid issuerId', async () =>
    request(express)
      .get(`/oidc/issuers/123123/clients/${clientId}`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.data?.total).toEqual(0);
        expect(status).toEqual(Status.NOT_FOUND);
      }));

  // OK
  it('should fail to GET /oidc/issuers/:issuerId/clients/:id, invalid clientId', async () =>
    request(express)
      .get(`/oidc/issuers/${issuerId}/clients/123123123`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.message).toContain('invalid input syntax for uuid');
        expect(status).toEqual(Status.BAD_REQUEST);
      }));

  // OK
  it('should GET /oidc/issuers/:issuerId/clients/:clientId', async () =>
    request(express)
      .get(`/oidc/issuers/${issuerId}/clients/${clientId}`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.data?.total).toEqual(1);
        expect(isOidcClient(body?.data?.items?.[0])).toBeTruthy();
        expect(body?.data?.items?.[0].client_id).toEqual(clientId);
        expect(status).toEqual(Status.OK);
      }));

  // OK
  it('should fail to GET /oidc/issuers/:id/clients', async () =>
    request(express)
      .get(`/oidc/issuers/123123123/clients`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.data?.total).toEqual(0);
        expect(status).toEqual(Status.NOT_FOUND);
      }));

  // OK
  it('should GET /oidc/issuers/:id/clients', async () =>
    request(express)
      .get(`/oidc/issuers/${issuerId}/clients`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(body?.data?.total).toEqual(1);
        expect(isOidcClient(body?.data?.items?.[0])).toBeTruthy();
        expect(body?.data?.items?.[0].client_id).toEqual(clientId);
        expect(status).toEqual(Status.OK);
      }));

  /**
   * Tear down tests
   */
  // OK
  it('should POST /actions/:tenantId/deactivate', async () =>
    request(express)
      .post(`/actions/${tenant.id}/deactivate`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data).toBeTruthy();
      }));

  // OK
  // NOTE: deactivation will NOT drop Schema
  it('should GET /actions/tenant_summary, after deactivation', async () =>
    request(express)
      .get('/actions/tenant_summary')
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data?.agentCount).toEqual(0);
      }));

  // todo: Add more test, to delete tenant
  // Below is NOT yet tested ok
  // it('should DELETE /tenants/:tenantId', async () =>
  //   request(express)
  //     .delete(`/tenants/${tenant.id}`)
  //     .set('host', 'example.com')
  //     .set('authorization', `Bearer`)
  //     .expect(({ body, error }) => {
  //       expect(body.status).toEqual('OK');
  //       expect(body.data).toEqual({ raw: [], affected: 1 });
  //       expect(error).toBeFalsy();
  //     }));
});

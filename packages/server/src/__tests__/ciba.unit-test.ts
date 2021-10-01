require('dotenv').config({ path: './.env' });
import qs from 'querystring';
import { Identifier } from '@veramo/data-store';
import didJWT from 'did-jwt';
import { Express } from 'express';
import Status from 'http-status';
import request from 'supertest';
import { Connection, ConnectionOptions, getRepository, getConnection } from 'typeorm';
import { Accounts, OidcClient, Sessions, Tenant, Users } from '../entities';
import type { CreateOidcVerifierArgs, CreateOidcVerifierClientArgs } from '../types';
import {
  createHttpServer,
  getClaimMappings,
  isTenant,
  isOidcVerifier,
  isOidcVerifierClient,
  generators,
} from '../utils';
import { holderDIDKey, holderPublicKeyJwk } from './__utils__/did-key';
import { fakedES256KKeys } from './__utils__/fakeKeys';

/**
 * Tests with Issue Credential workflow
 */

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
  JEST_FIXED_OIDC_VERIFIER_ID: process.env.JEST_FIXED_OIDC_VERIFIER_ID,
  JEST_FIXED_OIDC_ClIENT_ID: process.env.JEST_FIXED_OIDC_ClIENT_ID,
  // JWKS_JSON: process.env.JWKS_JSON,
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
let verifierId: string;
let clientId: string;
let openIdConfig: any;

const claims = {
  userinfo: {
    email: { essential: true },
    email_verified: null,
    name: null,
    'https://tenant.vii.mattr.global/educationalCredentialAwarded': { essential: true },
  },
  id_token: {
    auth_time: { essential: true },
    email: { essential: true },
    email_verified: null,
    'https://tenant.vii.mattr.global/educationalCredentialAwarded': { essential: true },
  },
};
// will prompt for scope grant
const response_type = 'code';
const alg = 'ES256K';
const id_token_signed_response_alg = 'ES256K';
const mapping = {
  jsonLdTerm: 'educationalCredentialAwarded',
  oidcClaim: 'https://tenant.vii.mattr.global/educationalCredentialAwarded',
};
const slug = 'verifier';
const scope = 'openid';
const login_hint = 'I am dgPXxUz_6fWIQBD8XmiSy';
const binding_message = 'W4SCT';
const client_assertion_type = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
const token_endpoint_auth_method = 'client_secret_post';
// const token_endpoint_auth_method = 'private_key_jwt';

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
    const tenant = await tenantRepo.findOne({ where: { slug } });

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
  return new Promise<void>((ok) => setTimeout(() => ok(), 3000));
});

describe('Authz unit test', () => {
  /**
   * Part 1: Preparing Oidc-client
   */
  it('should POST /tenants', async () =>
    request(express)
      .post(`/tenants`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .send({ slug, user_id: user.id })
      .expect(({ body, status }) => {
        expect(isTenant(body?.data)).toBeTruthy();
        expect(body?.status).toEqual('OK');
        expect(status).toEqual(Status.CREATED);
        tenant = body?.data;
      }));

  it('should POST /actions/:tenantId/activate', async () =>
    request(express)
      .post(`/actions/${tenant.id}/activate`)
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(async ({ body, status }) => {
        expect(body).toEqual({ status: 'OK', data: true });
        expect(status).toEqual(Status.OK);
      }));

  it('wait 5s', async () => new Promise((ok) => setTimeout(() => ok(true), 5000)));

  it('should GET /actions/tenant_summary, after activation', async () =>
    request(express)
      .get('/actions/tenant_summary')
      .set('host', 'example.com')
      .set('authorization', `Bearer`)
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        expect(body?.data?.agentCount).toEqual(1);
      }));

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
      .set('host', 'verifier.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body }) => expect(body).toEqual({ data: 'Agent found' })));

  it('should POST /oidc/verifiers', async () => {
    const payload: CreateOidcVerifierArgs = {
      presentationTemplateId: '123123',
      claimMappings: getClaimMappings([mapping]).mappings,
    };

    return request(express)
      .post('/oidc/verifiers')
      .set('host', 'verifier.example.com')
      .set('authorization', `Bearer`)
      .send(payload)
      .expect(({ body, status }) => {
        expect(isOidcVerifier(body?.data)).toBeTruthy();
        expect(status).toEqual(Status.CREATED);
        verifierId = body?.data?.id;
      });
  });

  it('should register oidc client', async () => {
    // Note: test will support "poll" only; backchannel_client_notification_endpoint is not required.
    // TODO: evaluate later, if we can figure out how to run unit test with "ping"
    const payload = <CreateOidcVerifierClientArgs>{
      client_name: 'Oidc client for wallet',
      grant_types: ['urn:openid:params:grant-type:ciba'],
      token_endpoint_auth_method,
      id_token_signed_response_alg,
      application_type: 'web',
      backchannel_token_delivery_mode: 'poll',
      // backchannel_authentication_request_signing_alg: 'ES256K',
      backchannel_user_code_parameter: true,
      redirect_uris: ['https://jwt.io'],
    };

    return request(express)
      .post(`/oidc/verifiers/${verifierId}/reg`)
      .set('host', 'verifier.example.com')
      .set('authorization', `Bearer`)
      .send(payload)
      .expect(({ body, status }) => {
        expect(isOidcVerifierClient(body?.data)).toBeTruthy();
        expect(status).toEqual(Status.CREATED);
        clientId = body?.data?.client_id;
        console.log(body?.data);
      });
  });

  /**
   * Part 2: Kick off interaction
   */
  it('should GET /oidc/issuers/:id/.well-known/openid-configuration', async () =>
    request(express)
      .get(`/oidc/verifiers/${verifierId}/.well-known/openid-configuration`)
      .set('host', 'verifier.example.com')
      .set('authorization', `Bearer`)
      .set('X-Forwarded-Proto', 'https')
      .expect(({ body, status }) => {
        expect(status).toEqual(Status.OK);
        openIdConfig = body;
      }));

  it('should kick off Credential Request', async () => {
    const clientRepo = getConnection(tenant.id).getRepository(OidcClient);
    const oidcClient = await clientRepo.findOne(clientId);
    const identifierRepo = getConnection(tenant.id).getRepository(Identifier);
    const identifier = await identifierRepo.findOne(oidcClient.did, { relations: ['keys'] });
    const { privateKeyHex } = identifier.keys[0];
    const signer = didJWT.ES256KSigner(privateKeyHex);

    const clientAssertion = await didJWT.createJWT(
      {
        sub: clientId,
        aud: openIdConfig.token_endpoint,
        jti: generators.nonce(),
        iat: ~~(Date.now() / 1000),
        nbf: ~~(Date.now() / 1000),
      },
      { issuer: clientId, signer, expiresIn: 86400 },
      { alg }
    );

    console.log('****** clientAssertion', clientAssertion);

    const signedRequest = await didJWT.createJWT(
      {
        aud: openIdConfig.issuer,
        iat: ~~(Date.now() / 1000),
        nbf: ~~(Date.now() / 1000),
        jti: generators.nonce(),
        scope,
        login_hint,
        binding_message,
        claims,
        // client_notifiication_token: ''
      },
      // when expires is greater than 1hr, will return this error "Request Object 'exp' claim too far from 'nbf' claim"
      { issuer: clientId, signer, expiresIn: 3600 },
      { alg }
    );

    const query = qs.stringify({
      request: signedRequest,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: clientAssertion,
    });

    console.log('****** signedRequest', signedRequest);

    // return request(express)
    //   .post(`/oidc/verifiers/${verifierId}/backchannel`)
    //   .set('host', 'verifier.example.com')
    //   .set('Content-Type', 'application/x-www-form-urlencoded')
    //   .set('X-Forwarded-Proto', 'https')
    //   .send(query)
    //   .expect((result) => {
    //     console.log(result.body);
    //   });
  });
});

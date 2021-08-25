require('dotenv').config({ path: './.env' });
import fs from 'fs';
import { Express } from 'express';
import Status from 'http-status';
import { parseJwk } from 'jose/jwk/parse';
import { SignJWT } from 'jose/jwt/sign';
import { generators } from 'openid-client';
import request from 'supertest';
import { Connection, ConnectionOptions, getRepository } from 'typeorm';
import { Accounts, Sessions, Tenant, Users } from '../entities';
import type { CreateOidcIssuerArgs, CreateOidcIssuerClientArgs } from '../types';
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
  JWKS_JSON: process.env.JWKS_JSON,
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
let issuerId: string;
let clientId: string;
let openIdConfig: any;

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

describe('Authz unit test', () => {
  /**
   * Part 1: Preparing Oidc-client
   */
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
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .expect(({ body }) => expect(body).toEqual({ data: 'Agent found' })));

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

  it('should register oidc client', async () =>
    request(express)
      .post(`/oidc/issuers/${issuerId}/reg`)
      .set('host', 'issuer.example.com')
      .set('authorization', `Bearer`)
      .send(<CreateOidcIssuerClientArgs>{
        client_name: 'Oidc client for wallet',
        redirect_uris: ['https://jwt.io'],
        response_types: ['code'],
        grant_types: ['authorization_code'],
        // response_types: ['id_token'],
        // grant_types: ['implicit'],
        token_endpoint_auth_method: 'client_secret_post',
        // must be 'RS256' or 'PS256', in order to use "state" params
        id_token_signed_response_alg: 'RS256',
        application_type: 'web',
      })
      .expect(({ body, status }) => {
        expect(isOidcClient(body?.data)).toBeTruthy();
        expect(status).toEqual(Status.CREATED);
        clientId = body?.data?.client_id;
      }));

  /**
   * Part 2: Kick off interaction
   */
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
        openIdConfig = body;
      }));

  // see https://mattrglobal.github.io/oidc-client-bound-assertions-spec
  it('should kick off Credential Request', async () => {
    const nonce = generators.nonce();
    const state = generators.state();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    const keyObject = JSON.parse(fs.readFileSync('./certs/jwks.json', { encoding: 'utf-8' }))
      .keys[0];
    const privateKey = await parseJwk(keyObject, 'RS256');
    // @see https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md
    const signedRequest = await new SignJWT({
      response_type: 'code',
      scope: 'openid openid_credential',
      redirect_uri: 'https://jwt.io',
      client_id: clientId,
      nonce,
      credential_format: 'w3cvc-jwt',
      code_challenge,
      code_challenge_method: 'S256',
      // EITHER did OR sub_jwk
      // did: 'did:web:issuer.example.com',
      sub_jwk: {
        kty: 'RSA',
        use: 'sig',
        kid: 'nL_5KPQjG45gpvegzs-d2pUUrjj2jRSNhI9cPK7xWG0',
        e: 'AQAB',
        n: 'mPV1Bc2mHCFxvtSAQkUHPlYMncXyMclSAayfBknpqznACwERQHvVksHfuf2CJSixgR7TwM2EiJuccM8Q2Er2WlCKMwMU2PYWzX-Lx2Eaiui44yfCqOJfMjhsDzoxwgosKTWmMTDOZY-NpWTe8XVisoi4Dll9UsU02ge1bABBtkgzkI7pdBC5jhQjXqClo4yLXUNataIzgAL7rE2FI_7pOz7DlMKB-46OBDA5fP9GGcb820O2u9BWMGni8qJ7Kc3oitUHEKV61IbKMxld9F6HlDLuvtrMYJFh8FzPM26wOakNhsylh1HOBLUvMNVWHa2uA0XSv0BN-1FKqEWc22kL8Q',
      },
      claims: {
        userinfo: {
          given_name: { essential: true },
          nickname: null,
          email: { essential: true },
          email_verified: { essential: true },
          picture: null,
        },
        id_token: {
          gender: null,
          birthdate: { essential: true },
          acr: { values: ['urn:mace:incommon:iap:silver'] },
        },
      },
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setIssuer(clientId)
      .setAudience(`https://issuer.example.com/oidc/issuers/${issuerId}`)
      .setSubject(`urn:uuid:${clientId}`)
      .setExpirationTime('100h')
      .sign(privateKey);

    return request(express)
      .get(`/oidc/issuers/${issuerId}/auth`)
      .query({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: 'https://jwt.io',
        scope: 'openid openid_credential',
        state,
        code_challenge,
        // use did or sub_jwk
        did: 'did:web:issuer.example.com',
        request: signedRequest,
      })
      .set('host', 'issuer.example.com')
      .set('Context-Type', 'application/x-www-form-urlencoded')
      .set('X-Forwarded-Proto', 'https')
      .redirects(1)
      .expect(({ headers }) => {
        console.log(headers);
      });
  });
});

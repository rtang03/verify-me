require('dotenv').config({ path: './.env' });
import { Identifier } from '@veramo/data-store';
import didJWT from 'did-jwt';
import { Express } from 'express';
import Status from 'http-status';
import request from 'supertest';
import { Connection, ConnectionOptions, getRepository, getConnection } from 'typeorm';
import { Accounts, OidcClient, Sessions, Tenant, Users } from '../entities';
import type { CreateOidcIssuerArgs, CreateOidcIssuerClientArgs } from '../types';
import {
  createHttpServer,
  getClaimMappings,
  isOidcClient,
  isOidcIssuer,
  isTenant,
  generators,
  convertKeyPairsToJwkEd22519,
} from '../utils';
import { fakedKeys } from './__utils__/fakeKeys';

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
  JEST_FIXED_OIDC_ISSUER_ID: process.env.JEST_FIXED_OIDC_ISSUER_ID,
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
let issuerId: string;
let clientId: string;
let openIdConfig: any;

// Test data
const claims = {
  userinfo: {
    given_name: { essential: true },
    nickname: null,
    email: { essential: true },
    email_verified: { essential: true },
    picture: null,
    'https://tenant.vii.mattr.global/educationalCredentialAwarded': { essential: true },
  },
  id_token: {
    acr: null,
    verifiable_presentations: {
      credential_types: [
        {
          type: 'https://tenant.vii.mattr.global/educationalCredentialAwarded',
          claims: {
            email: null,
            name: null,
            'https://tenant.vii.mattr.global/educationalCredentialAwarded': null,
          },
        },
      ],
    },
  },
};
const redirect_uri = 'https://jwt.io';
const credential_format = 'w3cvc-jwt';
const code_challenge_method = 'S256';
const scope = 'openid';
const response_type = 'code';
const alg = { alg: 'EdDSA' };
const mapping = {
  jsonLdTerm: 'educationalCredentialAwarded',
  oidcClaim: 'https://tenant.vii.mattr.global/educationalCredentialAwarded',
};

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
        claimMappings: getClaimMappings([mapping]).mappings,
      })
      .expect(({ body, status }) => {
        expect(isOidcIssuer(body?.data)).toBeTruthy();
        expect(status).toEqual(Status.CREATED);
        issuerId = body?.data?.id;
        console.log('Oidc-issuer', body.data);
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
        token_endpoint_auth_method: 'client_secret_post',
        // must be 'RS256' or 'PS256', in order to use "state" params
        id_token_signed_response_alg: 'EdDSA',
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

  // Each oidc-client is bound with one did:key.
  // Request-Object is required to signed with private key of this did:key identifier
  it('should fail to kick off Credential Request, faked signed JWT', async () => {
    const nonce = generators.nonce();
    const state = generators.state();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const { privateKeyHex } = fakedKeys;
    const signer = didJWT.EdDSASigner(privateKeyHex);
    const signedRequest = await didJWT.createJWT(
      {
        aud: `https://issuer.example.com/oidc/issuers/${issuerId}`,
        response_type,
        scope,
        state,
        redirect_uri,
        client_id: clientId,
        nonce,
        credential_format,
        code_challenge,
        code_challenge_method,
        did: 'did:web:issuer.example.com',
        claims,
      },
      { issuer: clientId, signer },
      alg
    );

    return request(express)
      .get(`/oidc/issuers/${issuerId}/auth`)
      .query({
        response_type,
        client_id: clientId,
        redirect_uri,
        scope,
        state,
        code_challenge,
        request: signedRequest,
      })
      .set('host', 'issuer.example.com')
      .set('Context-Type', 'application/x-www-form-urlencoded')
      .set('X-Forwarded-Proto', 'https')
      .expect(({ header }) =>
        // return error="invalid_request_object"
        expect(header.location).toContain(
          'https://jwt.io?error=invalid_request_object&error_description=could%20not%20validate%20Request%20Object'
        )
      );
  });

  // see https://mattrglobal.github.io/oidc-client-bound-assertions-spec
  it('should kick off Credential Request', async () => {
    const nonce = generators.nonce();
    const state = generators.state();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    // retrieve key pair for newly created Oidc-client
    const clientRepo = getConnection(tenant.id).getRepository(OidcClient);
    const oidcClient = await clientRepo.findOne(clientId);
    const identifierRepo = getConnection(tenant.id).getRepository(Identifier);
    const identifier = await identifierRepo.findOne(oidcClient.did, { relations: ['keys'] });
    const { publicKeyHex, privateKeyHex } = identifier.keys[0];
    const { publicKeyJwk } = convertKeyPairsToJwkEd22519(publicKeyHex);

    const signer = didJWT.EdDSASigner(privateKeyHex);
    const signedRequest = await didJWT.createJWT(
      {
        aud: `https://issuer.example.com/oidc/issuers/${issuerId}`,
        response_type,
        scope,
        state,
        redirect_uri,
        client_id: clientId,
        nonce,
        credential_format,
        code_challenge,
        code_challenge_method,
        sub_jwk: JSON.stringify(publicKeyJwk),
        claims,
      },
      // see https://github.com/decentralized-identity/did-jwt/blob/master/docs/guides/index.md
      { issuer: clientId, signer, expiresIn: 86400 }, // 24 hrs
      alg
    );

    return request(express)
      .get(`/oidc/issuers/${issuerId}/auth`)
      .query({
        response_type,
        client_id: clientId,
        redirect_uri,
        scope,
        state,
        code_challenge,
        request: signedRequest,
      })
      .set('host', 'issuer.example.com')
      .set('Context-Type', 'application/x-www-form-urlencoded')
      .set('X-Forwarded-Proto', 'https')
      .redirects(1)
      .expect(({ headers, body }) => {
        console.log(headers);
        console.log(body);
      });
  });
});

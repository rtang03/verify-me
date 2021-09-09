// require('dotenv').config({ path: './.env' });
// import { Identifier } from '@veramo/data-store';
// import didJWT from 'did-jwt';
// import { Express } from 'express';
// import Status from 'http-status';
// import request from 'supertest';
// import { Connection, ConnectionOptions, getRepository, getConnection } from 'typeorm';
// import { Accounts, OidcClient, Sessions, Tenant, Users } from '../entities';
// import type { CreateOidcIssuerArgs, CreateOidcIssuerClientArgs } from '../types';
// import {
//   createHttpServer,
//   getClaimMappings,
//   isOidcClient,
//   isOidcIssuer,
//   isTenant,
//   generators,
// } from '../utils';
// import { holderDIDKey, holderPublicKeyJwk } from './__utils__/did-key';
// import { fakedES256KKeys } from './__utils__/fakeKeys';
//
// /**
//  * Tests with Issue Credential workflow
//  */
//
// const ENV_VAR = {
//   HOST: process.env.HOST || '0.0.0.0',
//   PORT: parseInt(process.env.PORT, 10) || 3002,
//   DB_HOST: process.env.TYPEORM_HOST,
//   DB_PORT: parseInt(process.env.TYPEORM_PORT, 10),
//   DB_USERNAME: process.env.TYPEORM_USERNAME,
//   DB_PASSWORD: process.env.TYPEORM_PASSWORD,
//   DB_NAME: process.env.TYPEORM_DATABASE,
//   OIDC_JWKS_PRIVATE_KEY_FILE: process.env.OIDC_JWKS_PRIVATE_KEY_FILE,
//   AUTH0_CLIENT_ID: process.env.AUTH0_ID,
//   AUTH0_CLIENT_SECRET: process.env.AUTH0_SECRET,
//   JEST_FIXED_OIDC_ISSUER_ID: process.env.JEST_FIXED_OIDC_ISSUER_ID,
//   JEST_FIXED_OIDC_ClIENT_ID: process.env.JEST_FIXED_OIDC_ClIENT_ID,
//   // JWKS_JSON: process.env.JWKS_JSON,
// };
// const commonConnectionOptions: ConnectionOptions = {
//   name: 'default',
//   type: 'postgres',
//   host: ENV_VAR.DB_HOST,
//   port: ENV_VAR.DB_PORT,
//   username: ENV_VAR.DB_USERNAME,
//   password: ENV_VAR.DB_PASSWORD,
//   database: ENV_VAR.DB_NAME,
//   // must be non-synchronous; the dev-net is bootstraped with init-script
//   synchronize: false,
//   logging: true,
//   entities: [Tenant, Accounts, Users, Sessions],
// };
//
// let express: Express;
// let conn: Connection;
// let user: Users;
// let tenant: Tenant;
// let issuerId: string;
// let clientId: string;
// let openIdConfig: any;
// let code_verifier: string;
//
// // Test data
// // Important Rules:
// // 1. Both userInfo's and id_token's claims will prompt for Authorize; no matter "essential" or not
// // 2. the claim will be ordered by userInfo, and then id_token
// // 3. claims must be whitelisted in Oidc-Provider configuration
// // 4. default openid claims, e.g. auth_time, will NOT prompt
// // 5. Except "email", "profile", "address", "phone" scopes; other claims are grouped under "openid_credential"
// // 6. userInfo's and id_token's will be de-dup
// const claims = {
//   userinfo: {
//     email: { essential: true },
//     email_verified: null,
//     name: null,
//     'https://tenant.vii.mattr.global/educationalCredentialAwarded': { essential: true },
//   },
//   id_token: {
//     auth_time: { essential: true },
//     email: { essential: true },
//     email_verified: null,
//     'https://tenant.vii.mattr.global/educationalCredentialAwarded': { essential: true },
//   },
// };
// const redirect_uri = 'https://jwt.io';
// const credential_format = 'w3cvc-jwt';
// const code_challenge_method = 'S256';
// // will prompt for scope grant
// const scope = 'openid openid_credential';
// const response_type = 'code';
// const alg = 'ES256K';
// const id_token_signed_response_alg = 'ES256K';
// const mapping = {
//   jsonLdTerm: 'educationalCredentialAwarded',
//   oidcClaim: 'https://tenant.vii.mattr.global/educationalCredentialAwarded',
// };
// const response_mode = 'jwt';
// const holder = holderDIDKey.did;
// const federatedIdpUrl = 'https://dashslab.us.auth0.com';
//
// beforeAll(async () => {
//   try {
//     const { app, commonConnections, tenantManager } = await createHttpServer({
//       commonConnectionOptions,
//       envVariables: ENV_VAR,
//     });
//     express = app;
//     conn = commonConnections;
//
//     const _user = new Users();
//     _user.name = `tenant-tester_${~~(Math.random() * 10000)}`;
//     _user.email = `${_user.name}@example.com`;
//     user = await getRepository(Users).save(_user);
//
//     // retrieve "issuer" tenant
//     const tenantRepo = await getRepository(Tenant);
//     const tenant = await tenantRepo.findOne({ where: { slug: 'issuer' } });
//
//     if (tenant) {
//       // deactivate will not remove schema
//       const isDeactivated = await tenantManager.deactivate(tenant.id);
//       console.log(`Deactivted: ${isDeactivated}`);
//
//       // remove pre-existing "issuer" tenant
//
//       const result = await tenantRepo.delete(tenant.id);
//       result?.affected === 1 && console.log('one record deleted.');
//     }
//
//     if (!app) {
//       console.error('🚫  app is undefined');
//       process.exit(1);
//     }
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   }
// });
//
// afterAll(async () => {
//   // await getRepository(Users).delete(user.id);
//   await conn.close();
//   return new Promise<void>((ok) => setTimeout(() => ok(), 5000));
// });
//
// describe('Authz unit test', () => {
//   /**
//    * Part 1: Preparing Oidc-client
//    */
//   it('should POST /tenants', async () =>
//     request(express)
//       .post(`/tenants`)
//       .set('host', 'example.com')
//       .set('authorization', `Bearer`)
//       .send({ slug: 'issuer', user_id: user.id })
//       .expect(({ body, status }) => {
//         expect(isTenant(body?.data)).toBeTruthy();
//         expect(body?.status).toEqual('OK');
//         expect(status).toEqual(Status.CREATED);
//         tenant = body?.data;
//       }));
//
//   it('should POST /actions/:tenantId/activate', async () =>
//     request(express)
//       .post(`/actions/${tenant.id}/activate`)
//       .set('host', 'example.com')
//       .set('authorization', `Bearer`)
//       .expect(async ({ body, status }) => {
//         expect(body).toEqual({ status: 'OK', data: true });
//         expect(status).toEqual(Status.OK);
//       }));
//
//   it('wait 5s', async () => new Promise((ok) => setTimeout(() => ok(true), 5000)));
//
//   it('should GET /actions/tenant_summary, after activation', async () =>
//     request(express)
//       .get('/actions/tenant_summary')
//       .set('host', 'example.com')
//       .set('authorization', `Bearer`)
//       .expect(({ body, status }) => {
//         expect(status).toEqual(Status.OK);
//         expect(body?.data?.agentCount).toEqual(1);
//       }));
//
//   it('should GET /actions/:tenantId/tenant_status', async () =>
//     request(express)
//       .get(`/actions/${tenant.id}/tenant_status`)
//       .set('host', 'example.com')
//       .set('authorization', `Bearer`)
//       .expect(({ body, status }) => {
//         expect(status).toEqual(Status.OK);
//         expect(body?.data).toEqual({ isActivated: true, isSchemaExist: true, isAgentReady: true });
//       }));
//
//   it('should GET /is_agent_exist, after activation', async () =>
//     request(express)
//       .get('/is_agent_exist')
//       .set('host', 'issuer.example.com')
//       .set('authorization', `Bearer`)
//       .expect(({ body }) => expect(body).toEqual({ data: 'Agent found' })));
//
//   it('should POST /oidc/issuers', async () =>
//     request(express)
//       .post('/oidc/issuers')
//       .set('host', 'issuer.example.com')
//       .set('authorization', `Bearer`)
//       .send(<CreateOidcIssuerArgs>{
//         credential: {
//           issuerDid: 'did:web:issuer.example.com',
//           name: 'federated_credential',
//           description: 'unit test',
//           context: ['https://schema.org'],
//           type: 'AlumniCredential',
//         },
//         federatedProvider: {
//           url: federatedIdpUrl,
//           scope: ['openid', 'profile', 'email'],
//           clientId: ENV_VAR.AUTH0_CLIENT_ID,
//           clientSecret: ENV_VAR.AUTH0_CLIENT_SECRET,
//         },
//         claimMappings: getClaimMappings([mapping]).mappings,
//       })
//       .expect(({ body, status }) => {
//         expect(isOidcIssuer(body?.data)).toBeTruthy();
//         expect(status).toEqual(Status.CREATED);
//         issuerId = body?.data?.id;
//       }));
//
//   it('should register oidc client', async () =>
//     request(express)
//       .post(`/oidc/issuers/${issuerId}/reg`)
//       .set('host', 'issuer.example.com')
//       .set('authorization', `Bearer`)
//       .send(<CreateOidcIssuerClientArgs>{
//         client_name: 'Oidc client for wallet',
//         redirect_uris: ['https://jwt.io'],
//         response_types: ['code'],
//         grant_types: ['authorization_code'],
//         token_endpoint_auth_method: 'client_secret_post',
//         // must be 'RS256' or 'PS256', in order to use "state" params
//         id_token_signed_response_alg,
//         application_type: 'web',
//       })
//       .expect(({ body, status }) => {
//         expect(isOidcClient(body?.data)).toBeTruthy();
//         expect(status).toEqual(Status.CREATED);
//         clientId = body?.data?.client_id;
//       }));
//
//   /**
//    * Part 2: Kick off interaction
//    */
//   it('should GET /oidc/issuers/:id/.well-known/openid-configuration', async () =>
//     request(express)
//       .get(`/oidc/issuers/${issuerId}/.well-known/openid-configuration`)
//       .set('host', 'issuer.example.com')
//       .set('authorization', `Bearer`)
//       // handle this warning
//       // oidc-provider WARNING: x-forwarded-proto header not detected for an https issuer, you must configure your ssl offloading proxy and the provider
//       .set('X-Forwarded-Proto', 'https')
//       .expect(({ body, status }) => {
//         expect(body.subject_types_supported).toEqual(['public']);
//         expect(status).toEqual(Status.OK);
//         openIdConfig = body;
//       }));
//
//   // Each oidc-client is bound with one did:key.
//   // Request-Object is required to signed with private key of this did:key identifier
//   it('should fail to kick off Credential Request, faked signed JWT', async () => {
//     const nonce = generators.nonce();
//     const state = generators.state();
//     const code_verifier = generators.codeVerifier();
//     const code_challenge = generators.codeChallenge(code_verifier);
//     const { privateKeyHex } = fakedES256KKeys;
//     const signer = didJWT.ES256KSigner(privateKeyHex);
//     // NOTE: nbf and exp are mandatory, to fulfill FAPI
//     const signedRequest = await didJWT.createJWT(
//       {
//         aud: `https://issuer.example.com/oidc/issuers/${issuerId}`,
//         response_type,
//         scope,
//         state,
//         redirect_uri,
//         client_id: clientId,
//         nonce,
//         credential_format,
//         code_challenge,
//         code_challenge_method,
//         claims,
//         nbf: ~~(Date.now() / 1000),
//       },
//       { issuer: clientId, signer, expiresIn: 3600 },
//       { alg }
//     );
//
//     return request(express)
//       .get(`/oidc/issuers/${issuerId}/auth`)
//       .query({
//         response_type,
//         client_id: clientId,
//         redirect_uri,
//         scope,
//         state,
//         code_challenge,
//         request: signedRequest,
//         response_mode,
//       })
//       .set('host', 'issuer.example.com')
//       .set('Context-Type', 'application/x-www-form-urlencoded')
//       .set('X-Forwarded-Proto', 'https')
//       .expect(async ({ header }) => {
//         const jwt = header.location.split('response=')?.[1];
//         expect(typeof jwt).toEqual('string');
//         const jwtJson = await didJWT.decodeJWT(jwt);
//         expect(jwtJson.payload.error).toEqual('invalid_request_object');
//         expect(jwtJson.payload.error_description).toEqual('could not validate Request Object');
//       });
//   });
//
//   // More tests,
//   // 1. if the ClaimMapping is changed, oidc-provider reflects the changed configuration
//   // 2. if the expiresIn works
//
//   // see https://mattrglobal.github.io/oidc-client-bound-assertions-spec
//   it('should kick off Credential Request', async () => {
//     const nonce = generators.nonce();
//     const state = generators.state();
//     code_verifier = generators.codeVerifier();
//     const code_challenge = generators.codeChallenge(code_verifier);
//
//     console.log('*** code_verifier *** ', code_verifier);
//
//     // retrieve key pair for newly created Oidc-client
//     const clientRepo = getConnection(tenant.id).getRepository(OidcClient);
//     const oidcClient = await clientRepo.findOne(clientId);
//     const identifierRepo = getConnection(tenant.id).getRepository(Identifier);
//
//     // keys of Oidc-client, which signs the request object
//     const identifier = await identifierRepo.findOne(oidcClient.did, { relations: ['keys'] });
//     const { privateKeyHex } = identifier.keys[0];
//     const signer = didJWT.ES256KSigner(privateKeyHex);
//
//     // see https://github.com/decentralized-identity/did-jwt/blob/master/docs/guides/index.md
//     const signedRequest = await didJWT.createJWT(
//       {
//         aud: `https://issuer.example.com/oidc/issuers/${issuerId}`,
//         response_type,
//         scope,
//         state,
//         redirect_uri,
//         client_id: clientId,
//         nonce,
//         credential_format,
//         code_challenge,
//         code_challenge_method,
//         response_mode,
//         claims,
//         nbf: ~~(Date.now() / 1000),
//         did: holder,
//         // ‼️‼️ VERY IMPORTANT: "sub" defines the key material the Credential Holder is requesting the credential to be bound to
//         // BUT it is *NOT* used for signed the request object. The OidcAdapter will use OidcClient's keystore, to validate the
//         // signed request object; hence the signer is OidcClient's private key; not the requester's did:key
//         // Note: thee Oid-provider treats request-params as string
//         // https://github.com/panva/node-oidc-provider/blob/4f52a4cf62d0e2282a8f6a1759725b8633135b83/lib/actions/authorization/process_request_object.js#L98
//         sub_jwk: JSON.stringify(holderPublicKeyJwk),
//       },
//       // "fapi advanced" require the request object to contain an exp claim that has a lifetime of
//       // no longer than 60 minutes after the nbf claim
//       { issuer: clientId, signer, expiresIn: 3600 },
//       { alg }
//     );
//
//     return request(express)
//       .get(`/oidc/issuers/${issuerId}/auth`)
//       .query({
//         response_type,
//         client_id: clientId,
//         redirect_uri,
//         scope,
//         state,
//         code_challenge,
//         request: signedRequest,
//       })
//       .set('host', 'issuer.example.com')
//       .set('Context-Type', 'application/x-www-form-urlencoded')
//       .set('X-Forwarded-Proto', 'https')
//       .redirects(0)
//       .expect((result) => {
//         console.log(result);
//         // console.log(headers);
//         // console.log(body);
//       });
//
//     // JARM will return signed response as below
//     // https://jwt.io/?response=eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QiLCJraWQiOiIwNDgwODJhYWViYWU2NDJjY2RhYWIzMWExNTRlN2QwYTZkNGUyMjYwMThkZmNhZTkyZDA0YTQ5ZjAxYmMzZTIzNTRlNTc0YmY5Y2JhYjNiMjVlZjM3ZjFmZWZkNDRiYzE2MzlkOWFiOWMyZGMzYTFkM2YyNzEzM2IxNmVlYzExOGRhIn0.eyJjb2RlIjoicjFhR2ttbHRaV1M3RDlqdHB5NVB6ak9IRkJWTUdvNk4wVzFEdjQyU3JkSyIsInN0YXRlIjoicEllODV0MEZVRHBhOVZaQ012anR5N29OUXN6aFowWWkyakw0NDRGNnRhcyIsImF1ZCI6IlYxU3RHWFI4X1o1amRIaTZCLW15VCIsImV4cCI6MTYzMDgxMzc5MCwiaXNzIjoiaHR0cHM6Ly9pc3N1ZXIuZXhhbXBsZS5jb20vb2lkYy9pc3N1ZXJzL09iakVHbXd0RlYtOFlzMzVXQmlGNSJ9.SniYaEDtYAGj04JPKNT_buCMtwMRJU-Y7MMOkYmmdLLIxR0L1MmFFMnq6h6GZIG3F_TV0Oj-6T_frYo-wjguvg
//     // const header = {
//     //   alg: 'ES256K',
//     //   typ: 'JWT',
//     //   kid: '048082aaebae642ccdaab31a154e7d0a6d4e226018dfcae92d04a49f01bc3e2354e574bf9cbab3b25ef37f1fefd44bc1639d9ab9c2dc3a1d3f27133b16eec118da',
//     // };
//     // const payload = {
//     //   code: 'r1aGkmltZWS7D9jtpy5PzjOHFBVMGo6N0W1Dv42SrdK',
//     //   state: 'pIe85t0FUDpa9VZCMvjty7oNQszhZ0Yi2jL444F6tas',
//     //   aud: 'V1StGXR8_Z5jdHi6B-myT',
//     //   exp: 1630813790,
//     //   iss: 'https://issuer.example.com/oidc/issuers/ObjEGmwtFV-8Ys35WBiF5',
//     // };
//   });
// });

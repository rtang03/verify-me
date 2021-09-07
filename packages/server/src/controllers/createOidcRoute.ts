import assert from 'assert';
import { URLSearchParams } from 'url';
import util from 'util';
import { VerifiableCredential } from '@veramo/core';
import type { ICreateVerifiableCredentialArgs } from '@veramo/credential-w3c';
import Debug from 'debug';
import { NextFunction, Request, Response, Router } from 'express';
import Status from 'http-status';
import { createRemoteJWKSet } from 'jose/jwks/remote';
import { jwtVerify } from 'jose/jwt/verify';
import { JWK, Provider } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { OidcIssuer, Tenant } from '../entities';
import type { TenantManager } from '../types';
import { CONIG, fetchOpenIdConfiguration, OIDC_PROFILE_CLAIM_MAPPINGS } from '../utils';
import { createOidcClientRoute } from './createOidcClientRoute';
import { createOidcIssuerRoute } from './createOidcIssuerRoute';

interface RequestWithVhost extends Request {
  vhost?: any;
  issuerId?: string;
  tenantId?: string;
  issuer?: OidcIssuer;
  openIdConfig?: any;
  oidcProvider?: Provider;
}

const debug = Debug('utils:createOidcRoute');

const issuerIdMiddleware = async (req: RequestWithVhost, res: Response, next: NextFunction) => {
  req.issuerId = req.params.issuer_id;
  next();
};

const setNoCache = (req: Request, res: Response, next: NextFunction) => {
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store');
  next();
};

export const createOidcRoute = (tenantManger: TenantManager) => {
  const router = Router();
  const tenantRepo = getConnection('default').getRepository(Tenant);

  // add tenantId / slug to req
  router.use(async (req: RequestWithVhost, res, next) => {
    const slug = req.vhost[0];
    if (!slug) throw Error('missing slug');

    debug('slug: ', slug);

    const tenant = await tenantRepo.findOne({ slug });
    if (!tenant) throw Error('fail to retrieve tenant');

    debug('tenantId: ', tenant.id);
    req.tenantId = tenant.id;

    next();
  });

  // REST for oidc-issuer's client
  router.use(
    '/issuers/:issuer_id/clients',
    issuerIdMiddleware,
    createOidcClientRoute(tenantManger)
  );

  // oidc client registration, using default endpoint "oidc/issuers/:id/reg"
  router.use('/issuers/:issuer_id/reg', issuerIdMiddleware, createOidcClientRoute(tenantManger));

  // federated OIDC provide callback here, to exchange token
  // this endpoint will FURTHER redirect to /issuers/interaction/:uid/login
  // this endpoint is ensuring a stable api for federated provider.
  router.get('/issuers/:issuer_id/callback', (req, res) => {
    debug('GET /oidc/issuers/:issuer_id/callback');

    const s = req.query.state;
    const c = req.query.code;
    const issuerId = req.params.issuer_id;

    // NOTE: the "state" between oidc-issurer and federated provider is the interaction id "jti"
    const url = `/oidc/issuers/${issuerId}/interaction/${s}/login?code=${c}&state=${s}`;

    res.writeHead(302, { Location: url });
    res.end();
  });

  // the endpoint is invoked after the authenticated user is redirected from /callback?code=xxxxx
  // "code" is ready to exchange tokens
  router.get(
    '/issuers/:issuer_id/interaction/:uid/login',
    setNoCache,
    async (req: RequestWithVhost, res, next) => {
      try {
        const issuerId = req.params.issuer_id;
        const code = req.query.code as string;
        const state = req.query.state;
        const oidc = await tenantManger.createOrGetOidcProvider(
          req.hostname,
          req.tenantId,
          issuerId
        );

        // find Oidc-issuer
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
        const issuer = await issuerRepo.findOne(issuerId, {
          relations: ['credential', 'federatedProvider'],
        });

        const { uid, prompt, params, jti } = await oidc.interactionDetails(req, res);

        debug('GET /oidc/issuers/:issuer_id/interaction/%s/login', jti);

        debug('prompt: %O', prompt);
        // DEBUG: returns
        // { name: 'login', reasons: ['no_session'], details: {} };

        debug('params, %O', params);
        // returns
        // params = {
        //   client_id: 'V1StGXR8_Z5jdHi6B-myT',
        //   code_challenge: 'W2g1aioZbU_vV4ENw0poi6Hl0Glh4cuw_ZGWPvJDqdQ',
        //   code_challenge_method: 'S256',
        //   nonce: 'Zn6s54rgRDZSoo_IB_oumGCVYP_GVw-pR0SYXBjmxTg',
        //   redirect_uri: 'https://jwt.io',
        //   response_type: 'code',
        //   scope: 'openid openid_credential',
        //   state: 'ODXyVX2ZM4r4Z_X3RoeFBIJjMLuSPWBqmwLE4V9HyPY',
        //   claims:
        //     '{"userinfo":{"given_name":{"essential":true},"nickname":null,"email":{"essential":true},"email_verified":{"essential":true},"picture":null},"id_token":{"gender":null,"birthdate":{"essential":true},"acr":{"values":["urn:mace:incommon:iap:silver"]}}}',
        //   sub_jwk:
        //     '{"kty":"OKP","crv":"Ed25519","alg":"EdDSA","kid":"f68e25c94fb09c7f748d82d9dfe844a0ca6a9ed58771f14a4d5ff889f8ee2180","x":"9o4lyU-wnH90jYLZ3-hEoMpqntWHcfFKTV_4ifjuIYA"}',
        //   credential_format: 'w3cvc-jwt',
        // };

        // fetch OpenId Configuration
        const openIdConfigUrl = issuer?.federatedProvider?.url;
        const openIdConfig = openIdConfigUrl && (await fetchOpenIdConfiguration(openIdConfigUrl));

        if (!openIdConfig) return next(new Error('missing openid-configuration'));

        // Use federatedProvider
        const url = openIdConfig[CONIG.TOKEN];
        const body = new URLSearchParams();
        body.append('grant_type', 'authorization_code');
        body.append('client_id', issuer.federatedProvider.clientId);
        body.append('client_secret', issuer.federatedProvider.clientSecret);
        body.append('code', code);
        body.append('redirect_uri', issuer.federatedProvider.callbackUrl);

        const response = await fetch(url, { method: 'POST', body });

        if (response.status === Status.OK) {
          const tokens: { access_token: string; id_token: string } = await response.json();
          // NOTE: access_token issued by oidc-provider will expire, based oidc-provider (auth0) configuration
          // https://auth0.com/docs/tokens/access-tokens#-userinfo-endpoint-token-lifetime
          // expires by 24 hours. The expired tokens will fail the JWTVerify operations.

          // e.g. tokens
          // {
          //   access_token: 'oYNaAuIgHw_pzyet-hLxJfjU64vKBjTu',
          //   id_token:
          //     'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJTMzh4M2pJTHN4M0J3dHdTM3BCeiJ9.eyJodHRwczovL3RlbmFudC52aWkubWF0dHIuZ2xvYmFsL2VkdWNhdGlvbmFsQ3JlZGVudGlhbEF3YXJkZWQiOiJDZXJ0aWZpY2F0ZSBOYW1lIiwibmlja25hbWUiOiJ0YW5ncm9zcyIsIm5hbWUiOiJ0YW5ncm9zc0Bob3RtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci85OGJiY2I3MTZhNTZhNTA5YmI4ZGMwNmFhYjg0MzEzZD9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnRhLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIxLTA3LTAxVDA3OjUzOjQ2Ljc5NFoiLCJlbWFpbCI6InRhbmdyb3NzQGhvdG1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vZGFzaHNsYWIudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYwNTlhZWQ0YWE3ODAzMDA2YTIwZDgyNCIsImF1ZCI6ImNHRXhjUDRjeTNlbGp6bGhnaEJoVG9SUDQ2YlAzYkxZIiwiaWF0IjoxNjI1MTM1OTAzLCJleHAiOjE2MjUxNzE5MDN9.ihWIwT-6jPc5WYweQm9kIceEt1Q8LL8aY4wvWAzTP4neG2ZCBxAmINzcwdrYMXuLS-M-1O4-g2G9R5XwBsKThXEIjyYWtal5h7YvVF_G4Xo2SITgeTZQ8ORtja7YLyCzLnE5pOBZVhVWF5EiAKv-5FlL7sk-K-99sU8YjfmbF9x5AyqRJj2H_f67HKm6wbg9xE-jnnUZnF8HjzKlJd1TeqO9H2x7XZfSiPZwq-i3gT5qwRYm_TzGcygKuUpa4-4rzjfIpSWSrR7HsuP3kPwaryHvyTb4jmoQJ7YksxNT7SPL0_oS1nZkPIPFX3BZNNX_k5GB7XH7zN2p0kQGgbmFug',
          //   scope: 'openid profile email',
          //   expires_in: 86400,
          //   token_type: 'Bearer',
          // };
          // id_token decodes to {
          //   'https://tenant.vii.mattr.global/educationalCredentialAwarded': 'Certificate Name', <== custom meta_data field
          //   nickname: 'tangross',
          //   name: 'tangross@hotmail.com',
          //   picture:
          //     'https://s.gravatar.com/avatar/98bbcb716a56a509bb8dc06aab84313d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fta.png',
          //   updated_at: '2021-07-01T07:53:46.794Z',
          //   email: 'tangross@hotmail.com',
          //   email_verified: true,
          //   iss: 'https://dashslab.us.auth0.com/', <== Auth0's tenant url
          //   sub: 'auth0|6059aed4aa7803006a20d824', <== user_id of Auth0
          //   aud: 'cGExcP4cy3eljzlhghBhToRP46bP3bLY', <== client_id of Auth0's application
          //   iat: 1625135903,
          //   exp: 1625171903,
          //   nonce: 'eZqhpaSuYMsBNNNt31PBbniLTiIiEpBKS2jgvmMOKuE'
          // };
          // NOTE: see https://auth0.com/docs/tokens/id-tokens
          // Here decides to using id_token, to translate from Oidc claim into JsonLdTern
          // No further fetch from /userinfo is required.

          let result;
          let id_token;
          // Validation 1: retrieve id_token, and verify it, and claims against the federated Oidc provider
          // see https://github.com/panva/jose/blob/main/docs/interfaces/jwt_verify.JWTVerifyOptions.md
          try {
            const jwks = createRemoteJWKSet(new URL(openIdConfig[CONIG.JWKS]));
            const { payload } = await jwtVerify(tokens.id_token, jwks, {
              // ‼️ NOTE: "iss" of id_token by Auth0 is ended with "/". This is dangerous to assume, other Idp will behaviour similarly
              issuer: issuer.federatedProvider.url + '/',
              audience: issuer.federatedProvider.clientId,
            });

            // decoded payload (i.e. id_token) will be passed, via "result" to next interaction.
            id_token = payload;

            // ‼️ id_token from federated Idp is appended to interaction result
            result = {
              login: { accountId: payload.sub, acr: '0' },
              id_token,
              id_tokenJwt: tokens.id_token,
            };
          } catch (err) {
            console.error(err);
            result = {
              error: 'invalid_jwt',
              error_description: 'fail to validate jwt',
            };
          }

          // Validation 2: nonce (handling replay attack)
          !result?.error &&
            params.nonce !== id_token?.nonce &&
            (result = {
              error: 'invalid_nonce',
              error_description: 'fail to validate nonce',
            });

          // Validation 3: state (handling csrf)
          // The state of federated request is "jti"
          !result?.error &&
            jti !== state &&
            (result = {
              error: 'invalid_state',
              error_description: 'fail to validate state',
            });

          await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        } else {
          const error = await response.text();
          console.error(util.format('fail to exchange token, %j', error));
          res.status(Status.BAD_REQUEST).send({ error });
        }
      } catch (err) {
        return next(err);
      }
    }
  );

  // kick off interaction
  router.get(
    '/issuers/:issuer_id/interaction/:uid',
    setNoCache,
    async (req: RequestWithVhost, res, next) => {
      try {
        const issuerId = req.params.issuer_id;
        const oidc = await tenantManger.createOrGetOidcProvider(
          req.hostname,
          req.tenantId,
          issuerId
        );
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
        const issuer = await issuerRepo.findOne(issuerId, {
          relations: ['credential', 'federatedProvider'],
        });
        const details = await oidc.interactionDetails(req, res);

        debug('GET /oidc/issuers/:issuer_id/interaction/%s', details.uid);
        debug('see what else is available to you for interaction views');
        debug('%O', details);

        const { uid, prompt, params, jti } = details;
        const client = await oidc.Client.find(params.client_id as string);

        // fetch OpenId Configuration
        const openIdConfigUrl = issuer?.federatedProvider?.url;
        const openIdConfig = openIdConfigUrl && (await fetchOpenIdConfiguration(openIdConfigUrl));

        if (!openIdConfig) return next(new Error('missing openid-configuration'));

        // Different prompt will have different details / params
        // "login" will redirect to federatedProvider's login page
        // "consent" renders Access / Deny page
        if (prompt.name === 'login') {
          // Debug: details returns
          // details = {
          //   grantId: null,
          //   iat: 1630164728,
          //   exp: 1630168328,
          //   returnTo:
          //     'https://issuer.example.com/oidc/issuers/ObjEGmwtFV-8Ys35WBiF5/auth/WUABDA0dp3iBCuTdhD8F5',
          //   prompt: { name: 'login', reasons: ['no_session'], details: {} },
          //   params: {
          //     client_id: 'V1StGXR8_Z5jdHi6B-myT',
          //     code_challenge: 'W2g1aioZbU_vV4ENw0poi6Hl0Glh4cuw_ZGWPvJDqdQ',
          //     code_challenge_method: 'S256',
          //     nonce: 'Zn6s54rgRDZSoo_IB_oumGCVYP_GVw-pR0SYXBjmxTg',
          //     redirect_uri: 'https://jwt.io',
          //     response_type: 'code',
          //     scope: 'openid openid_credential',
          //     state: 'ODXyVX2ZM4r4Z_X3RoeFBIJjMLuSPWBqmwLE4V9HyPY',
          //     claims:
          //       '{"userinfo":{"given_name":{"essential":true},"nickname":null,"email":{"essential":true},"email_verified":{"essential":true},"picture":null},"id_token":{"gender":null,"birthdate":{"essential":true},"acr":{"values":["urn:mace:incommon:iap:silver"]}}}',
          //     sub_jwk:
          //       '{"kty":"OKP","crv":"Ed25519","alg":"EdDSA","kid":"f68e25c94fb09c7f748d82d9dfe844a0ca6a9ed58771f14a4d5ff889f8ee2180","x":"9o4lyU-wnH90jYLZ3-hEoMpqntWHcfFKTV_4ifjuIYA"}',
          //     credential_format: 'w3cvc-jwt',
          //   },
          //   jti: 'WUABDA0dp3iBCuTdhD8F5',
          // };

          const base = openIdConfig[CONIG.AUTH];
          const t = 'code';
          const c = issuer.federatedProvider?.clientId;
          const r = issuer.federatedProvider?.callbackUrl;
          const s = issuer.federatedProvider?.scope;
          const n = params.nonce;

          if (!r)
            return res
              .status(Status.BAD_REQUEST)
              .send({ status: 'ERROR', error: 'missing redirect_uri' });

          if (!n)
            return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing nonce' });

          if (!s.includes('openid'))
            return res
              .status(Status.BAD_REQUEST)
              .send({ status: 'ERROR', error: 'scope must include openid' });

          // return e.g. 'openid%20profile%20email';
          const scope = s.reduce((prev, curr) => (prev ? `${prev}%20${curr}` : curr), '');

          // NOTE: jti (interaction/payload id) is used as state; so that the federated provider
          // will response to /oidc/issuers/:issuer_id/callback with query param "state" = jti
          const url = `${base}?response_type=${t}&client_id=${c}&redirect_uri=${r}&scope=${scope}&state=${jti}&nonce=${n}`;

          res.writeHead(Status.FOUND, { Location: url });
          res.end();
        } else {
          // Authorize - giving consent

          // Debug:  details returns
          // const details = {
          //   grantId: null,
          //   iat: 1630310666,
          //   exp: 1630314266,
          //   returnTo:
          //     'https://issuer.example.com/oidc/issuers/ObjEGmwtFV-8Ys35WBiF5/auth/vQbw7zkWSKBUSNYzNTTcE',
          //   prompt: {
          //     name: 'consent',
          //     reasons: ['op_scopes_missing', 'op_claims_missing'],
          //     details: { missingOIDCScope: [Array], missingOIDCClaims: [Array] },
          //   },
          //   lastSubmission: {
          //     login: { accountId: 'auth0|6059aed4aa7803006a20d824', acr: '0' },
          //     id_tokenJwt: 'xxxx',
          //     id_token: {
          //       'https://tenant.vii.mattr.global/educationalCredentialAwarded': 'Certificate Name',
          //       nickname: 'tangross',
          //       name: 'tangross@hotmail.com',
          //       picture: 'omit here'
          //       updated_at: '2021-08-28T05:54:47.837Z',
          //       email: 'tangross@hotmail.com',
          //       email_verified: true,
          //       iss: 'https://dashslab.us.auth0.com/',
          //       sub: 'auth0|6059aed4aa7803006a20d824',
          //       aud: 'cGExcP4cy3eljzlhghBhToRP46bP3bLY',
          //       iat: 1630310664,
          //       exp: 1630346664,
          //       nonce: 'Cag4DLJVFPz2grV3yDmTKFZdeGlzX8S8loh63njDXyg'
          //     },
          //   },
          //   params: {
          //     client_id: 'V1StGXR8_Z5jdHi6B-myT',
          //     code_challenge: 'l-nibgGrV8OcJkAog-IpkkjM2uZgwz2MgI9AqIeUo4c',
          //     code_challenge_method: 'S256',
          //     nonce: '5fZ0Qn0fSyLtbwL43eAB0RLmauxukAqWaBn2nXzGMIA',
          //     redirect_uri: 'https://jwt.io',
          //     response_type: 'code',
          //     scope: 'openid openid_credential',
          //     state: 'W0T4OS4-DYqDaZ0x0SwzKfc2z8g65o3pt2GSgPaBJqc',
          //     claims:
          //       '{"userinfo":{"email":{"essential":true},"name":null,"https://tenant.vii.mattr.global/educationalCredentialAwarded":{"essential":true}},"id_token":{"auth_time":{"essential":true},"email":{"essential":true},"https://tenant.vii.mattr.global/educationalCredentialAwarded":{"essential":true}}}',
          //     did: 'did:web:issuer.example.com'
          //     credential_format: 'w3cvc-jwt',
          //   },
          //   session: {
          //     accountId: 'auth0|6059aed4aa7803006a20d824',
          //     uid: 'M_ZWtDW8TwKO7CN2GA5YS',
          //     cookie: 'pgXv1OhEl0KXlAg7mRpHa',
          //     acr: '0',
          //   },
          //   jti: 'vQbw7zkWSKBUSNYzNTTcE',
          // };

          // Check the id_token obtained from federated oidc provider, fulfilling the claim request
          // if not fulfilled, will finish interaction
          const federatedIdToken = details.lastSubmission?.id_token;
          const federatedIdTokenJwt = details.lastSubmission?.id_tokenJwt;
          const requiredOIDCClaims = prompt.details.missingOIDCClaims as string[];
          const isFullfilled = requiredOIDCClaims
            .map((claim) => !!federatedIdToken?.[claim])
            .reduce((prev, curr) => prev && curr, true);

          debug('federated id_token is %s', isFullfilled ? 'valid' : 'invalid');

          if (!isFullfilled) {
            return await oidc.interactionFinished(
              req,
              res,
              {
                error: 'access_denied',
                error_description: 'federated id_token invalid',
              },
              { mergeWithLastSubmission: false }
            );
          }

          // fullfilled claims is passed to interaction.ejs. After confirmation, the requested claim
          // is passed to endpoint "/issuers/:issuer_id/interaction/:uid/confirm"
          // Optionally, interaction.ejs may display the fullfilled claim values; when confirming
          const fulfilledClaim = {};
          requiredOIDCClaims.forEach((claim) => (fulfilledClaim[claim] = federatedIdToken[claim]));

          // Authorize will render screen to Grant Access, after login successfully
          res.render('interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
            issuerId,
            fulfilledClaim,
            federatedIdTokenJwt,
          });
        }
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post(
    '/issuers/:issuer_id/interaction/:uid/confirm',
    setNoCache,
    async (req: RequestWithVhost, res, next) => {
      try {
        const issuerId = req.params.issuer_id;
        const oidc = await tenantManger.createOrGetOidcProvider(
          req.hostname,
          req.tenantId,
          issuerId
        );
        const federatedIdToken = req.body?.id_token;
        const interactionDetails = await oidc.interactionDetails(req, res);

        debug('POST /oidc/issuers/:issuer_id/interaction/%s/confirm', interactionDetails.jti);
        debug('======%O', interactionDetails);

        // interactionDetails returns
        // interactionDetails = {
        //   grantId: null,
        //   iat: 1630653824,
        //   exp: 1630657424,
        //   returnTo:
        //     'https://issuer.example.com/oidc/issuers/ObjEGmwtFV-8Ys35WBiF5/auth/1yfJD8vAPfQ1SYptnqgU0',
        //   prompt: {
        //     name: 'consent',
        //     reasons: ['op_scopes_missing', 'op_claims_missing'],
        //     details: { missingOIDCScope: [Array], missingOIDCClaims: [Array] },
        //   },
        //   params: {
        //     client_id: 'V1StGXR8_Z5jdHi6B-myT',
        //     code_challenge: 'WP_HSK7UQ-bRh6Y9r0Tre4GGTJf7QJjCh8rT23aQY1Q',
        //     code_challenge_method: 'S256',
        //     nonce: 'Cag4DLJVFPz2grV3yDmTKFZdeGlzX8S8loh63njDXyg',
        //     redirect_uri: 'https://jwt.io',
        //     response_type: 'code',
        //     scope: 'openid openid_credential',
        //     state: '-JUd7rFDHh64G-qTqjM3eF3TyfbFRznfg2m5ip3kt_M',
        //     claims:
        //       '{"userinfo":{"email":{"essential":true},"name":null,"https://tenant.vii.mattr.global/educationalCredentialAwarded":{"essential":true}},"id_token":{"auth_time":{"essential":true},"email":{"essential":true},"https://tenant.vii.mattr.global/educationalCredentialAwarded":{"essential":true}}}',
        //     did: 'did:web:issuer.example.com',
        //     credential_format: 'w3cvc-jwt',
        //   },
        //   session: {
        //     accountId: 'auth0|6059aed4aa7803006a20d824',
        //     uid: 'zOsjJfiW2vMu-c74Kg8mw',
        //     cookie: 'grzUuDczPaJ9En8-tq3FO',
        //     acr: '0',
        //   },
        //   kind: 'Interaction',
        //   jti: '1yfJD8vAPfQ1SYptnqgU0',
        // };

        const {
          prompt: { name, details },
          params,
          session: { accountId },
        } = interactionDetails;
        const clientId = params.client_id as string;
        let { grantId } = interactionDetails;
        const requesterDid = params.did as string;
        const jwk: JWK = JSON.parse(params.sub_jwk as string);

        assert.strictEqual(name, 'consent');

        // find Oidc-issuer
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
        const issuer = await issuerRepo.findOne(issuerId, {
          relations: ['credential', 'federatedProvider'],
        });
        const claimMappings = issuer.claimMappings;

        // fetch OpenId Configuration
        const openIdConfigUrl = issuer?.federatedProvider?.url;
        const openIdConfig = openIdConfigUrl && (await fetchOpenIdConfiguration(openIdConfigUrl));

        // validate JWT against federated oidc provider
        // user-submitted consent requires validation
        const jwks = createRemoteJWKSet(new URL(openIdConfig[CONIG.JWKS]));
        const verified = await jwtVerify(federatedIdToken, jwks, {
          issuer: issuer.federatedProvider.url + '/',
          audience: issuer.federatedProvider.clientId,
        });
        const federatedIdTokenClaims = verified.payload;

        // Get or create grantId
        const grant = grantId
          ? await oidc.Grant.find(grantId)
          : new oidc.Grant({ accountId, clientId });

        // use grant.rejectOIDCScope to reject a subset or the whole thing
        details.missingOIDCScope &&
          grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '));

        // use grant.rejectOIDCClaims to reject a subset or the whole thing
        details.missingOIDCClaims && grant.addOIDCClaims(details.missingOIDCClaims as string[]);

        // ❕Reserved only. ResourcesScopes is not enabled
        // Please don't delete commented code. Maybe useful later.
        // if (details.missingResourceScopes) {
        //   // eslint-disable-next-line no-restricted-syntax
        //   for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
        //     grant.addResourceScope(indicator, scopes.join(' '));
        //     // use grant.rejectResourceScope to reject a subset or the whole thing
        //   }
        // }

        grantId = await grant.save();

        const consent: any = {};

        // we don't have to pass grantId to consent, we're just modifying existing one
        if (!interactionDetails.grantId) consent.grantId = grantId;

        const result = { consent };

        // Convert from OidcClaim + user-defined claim, into JsonLdTerm
        // It attempts to follow JsonLd format, so that later can perform context validation
        const mapFromOidcClaimToJsonLdTerm = [
          ...OIDC_PROFILE_CLAIM_MAPPINGS,
          ...claimMappings,
        ].reduce((obj, { oidcClaim, jsonLdTerm }) => ({ ...obj, [oidcClaim]: jsonLdTerm }), {});
        const requestedClaims = (details.missingOIDCClaims as string[])
          .map((oidcClaim) => [oidcClaim, federatedIdTokenClaims[oidcClaim]] as [string, string])
          .map(([oidcClaim, value]) => [mapFromOidcClaimToJsonLdTerm[oidcClaim], value])
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        // create VC using grantId
        const slug = req.vhost[0];
        const agent = tenantManger.getAgents()[slug];
        const createVCArgs: ICreateVerifiableCredentialArgs = {
          credential: {
            id: grantId,
            '@context': [
              'https://www.w3.org/2018/credentials/v1',
              'https://www.w3.org/2018/credentials/examples/v1',
            ],
            type: ['VerifiableCredential', 'Profile'],
            issuer: { id: issuer.did },
            credentialSubject: {
              id: requesterDid,
              jwk,
              ...requestedClaims,
            },
          },
          proofFormat: 'jwt',
          save: true,
        };
        const vc: VerifiableCredential = await agent.execute(
          'createVerifiableCredential',
          createVCArgs
        );

        debug('VC being saved, %O', vc);

        // create VP
        // const createVPArgs: ICreateVerifiablePresentationArgs = {
        //   presentation: {
        //     '@context': ['https://www.w3.org/2018/credentials/v1'],
        //     type: ['VerifiablePresentation'],
        //     // TODO: revisit me, if using grantId or jti or uid
        //     // OidcAdapter use presentation id, to retrieve VP, to construct id_token and/or userInfo
        //     id: grantId,
        //     verifiableCredential: [vc],
        //     holder: requesterDid,
        //     // TODO: revisit me later
        //     // verifier: ['NOT applicable']
        //   },
        //   save: true,
        //   proofFormat: 'jwt',
        // };
        // const vp: VerifiablePresentation = await agent.execute(
        //   'createVerifiablePresentation',
        //   createVPArgs
        // );
        // debug('VP being saved, %O', vp);

        await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    '/issuers/:issuer_id/interaction/:uid/abort',
    setNoCache,
    async (req: RequestWithVhost, res, next) => {
      try {
        const issuerId = req.params.issuer_id;
        const oidc = await tenantManger.createOrGetOidcProvider(
          req.hostname,
          req.tenantId,
          issuerId
        );
        const interactionDetails = await oidc.interactionDetails(req, res);

        debug('POST /oidc/issuers/:issuer_id/interaction/%s/abort', interactionDetails.uid);

        const result = {
          error: 'access_denied',
          error_description: 'End-User aborted interaction',
        };
        await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
      } catch (err) {
        next(err);
      }
    }
  );

  // ⁉️ TODO: DOUBLE CHECK ME, IF I AM AT THE RIGHT POSITION
  router.use('/issuers', createOidcIssuerRoute(tenantManger));

  /**
   * 📌 IMPORTANT: Oidc-provider is added to each Oidc-issuer
   */
  router.use('/issuers/:id', async (req: RequestWithVhost, res) => {
    const issuerId = req.params.id;
    const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);

    try {
      const issuer = await issuerRepo.findOne(issuerId);

      if (!issuer) return res.status(Status.BAD_REQUEST).send({ error: 'Invalid issuer id' });
    } catch (error) {
      console.warn(error);
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: error.message });
    }

    const oidc = await tenantManger.createOrGetOidcProvider(req.hostname, req.tenantId, issuerId);

    debug('Start at /oidc/issuers/:issuer_id, %s', issuerId);

    return oidc
      ? oidc.callback()(req, res)
      : res.status(Status.BAD_REQUEST).send({ error: 'Oidc provider not found' });
  });

  return router;
};

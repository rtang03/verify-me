import assert from 'assert';
import { createPublicKey } from 'crypto';
import fs from 'fs';
import { URLSearchParams } from 'url';
import util from 'util';
import Debug from 'debug';
import { NextFunction, Request, Response, Router } from 'express';
import Status from 'http-status';
import { jwtVerify, JWTVerifyResult } from 'jose/jwt/verify';
import jwt_decode from 'jwt-decode';
import { Provider } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { OidcIssuer, Tenant } from '../entities';
import type { TenantManager } from '../types';
import { CONIG, fetchOpenIdConfiguration, isCredentialRequestPayload } from '../utils';
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
  router.use('/issuers/:issuer_id/clients', issuerIdMiddleware, createOidcClientRoute());

  // oidc client registration, using default endpoint "oidc/issuers/:id/reg"
  router.use('/issuers/:issuer_id/reg', issuerIdMiddleware, createOidcClientRoute());

  // federated OIDC provide callback here, to exchange token
  // this endpoint will redirect to /issuers/interaction/:uid/login
  router.get('/issuers/:issuer_id/callback', (req, res) => {
    debug('GET /oidc/issuers/:issuer_id/callback');
    const issuerId = req.params.issuer_id;
    const url = `/oidc/issuers/${issuerId}/interaction/${req.query.state}/login?code=${req.query.code}&state=${req.query.state}`;

    res.writeHead(302, { Location: url });
    res.end();
  });

  router.get(
    '/issuers/:issuer_id/interaction/:uid/login',
    setNoCache,
    async (req: RequestWithVhost, res, next) => {
      try {
        const issuerId = req.params.issuer_id;
        const code = req.query.code as string;
        const state = req.query.state;
        const oidc = tenantManger.createOrGetOidcProvider(req.hostname, req.tenantId, issuerId);
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
        const issuer = await issuerRepo.findOne(issuerId, {
          relations: ['credential', 'federatedProvider'],
        });

        const { uid, prompt, params } = await oidc.interactionDetails(req, res);

        debug('GET /oidc/issuers/:issuer_id/interaction/%s/login', uid);
        debug('prompt: %O', prompt);
        debug('params, %O', params);

        if (state !== uid) {
          // this handles replay attack
          console.error('This is invalid request, should throw');
        }

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

        // this fetch will give the tls warning
        // (node:34683) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification
        const response = await fetch(url, { method: 'POST', body });
        if (response.status === Status.OK) {
          const tokens: { access_token: string; id_token: string } = await response.json();
          // {
          //   access_token: 'oYNaAuIgHw_pzyet-hLxJfjU64vKBjTu',
          //   id_token:
          //     'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJTMzh4M2pJTHN4M0J3dHdTM3BCeiJ9.eyJodHRwczovL3RlbmFudC52aWkubWF0dHIuZ2xvYmFsL2VkdWNhdGlvbmFsQ3JlZGVudGlhbEF3YXJkZWQiOiJDZXJ0aWZpY2F0ZSBOYW1lIiwibmlja25hbWUiOiJ0YW5ncm9zcyIsIm5hbWUiOiJ0YW5ncm9zc0Bob3RtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci85OGJiY2I3MTZhNTZhNTA5YmI4ZGMwNmFhYjg0MzEzZD9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnRhLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIxLTA3LTAxVDA3OjUzOjQ2Ljc5NFoiLCJlbWFpbCI6InRhbmdyb3NzQGhvdG1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vZGFzaHNsYWIudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYwNTlhZWQ0YWE3ODAzMDA2YTIwZDgyNCIsImF1ZCI6ImNHRXhjUDRjeTNlbGp6bGhnaEJoVG9SUDQ2YlAzYkxZIiwiaWF0IjoxNjI1MTM1OTAzLCJleHAiOjE2MjUxNzE5MDN9.ihWIwT-6jPc5WYweQm9kIceEt1Q8LL8aY4wvWAzTP4neG2ZCBxAmINzcwdrYMXuLS-M-1O4-g2G9R5XwBsKThXEIjyYWtal5h7YvVF_G4Xo2SITgeTZQ8ORtja7YLyCzLnE5pOBZVhVWF5EiAKv-5FlL7sk-K-99sU8YjfmbF9x5AyqRJj2H_f67HKm6wbg9xE-jnnUZnF8HjzKlJd1TeqO9H2x7XZfSiPZwq-i3gT5qwRYm_TzGcygKuUpa4-4rzjfIpSWSrR7HsuP3kPwaryHvyTb4jmoQJ7YksxNT7SPL0_oS1nZkPIPFX3BZNNX_k5GB7XH7zN2p0kQGgbmFug',
          //   scope: 'openid profile email',
          //   expires_in: 86400,
          //   token_type: 'Bearer',
          // };
          // id_token decodes to {
          //   'https://tenant.vii.mattr.global/educationalCredentialAwarded': 'Certificate Name',
          //   nickname: 'tangross',
          //   name: 'tangross@hotmail.com',
          //   picture:
          //     'https://s.gravatar.com/avatar/98bbcb716a56a509bb8dc06aab84313d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fta.png',
          //   updated_at: '2021-07-01T07:53:46.794Z',
          //   email: 'tangross@hotmail.com',
          //   email_verified: true,
          //   iss: 'https://dashslab.us.auth0.com/',
          //   sub: 'auth0|6059aed4aa7803006a20d824',
          //   aud: 'cGExcP4cy3eljzlhghBhToRP46bP3bLY',
          //   iat: 1625135903,
          //   exp: 1625171903,
          // };

          // retrieve id_token
          const id_token: any = jwt_decode(tokens.id_token);

          // retrieve userInfo
          const userInfoUrl = openIdConfig[CONIG.ME];
          const userInfo = await fetch(userInfoUrl, {
            headers: { authorization: `Bearer ${tokens.access_token}` },
          }).then((r) => r.json());

          const result = { login: { accountId: id_token?.sub, acr: '0' }, id_token, userInfo };
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
        const oidc = tenantManger.createOrGetOidcProvider(req.hostname, req.tenantId, issuerId);
        const issuerRepo = getConnection(req.tenantId).getRepository(OidcIssuer);
        const issuer = await issuerRepo.findOne(issuerId, {
          relations: ['credential', 'federatedProvider'],
        });
        const details = await oidc.interactionDetails(req, res);

        debug('GET /oidc/issuers/:issuer_id/interaction/%s', details.uid);
        debug('see what else is available to you for interaction views');
        debug('%O', details);

        const { uid, prompt, params } = details;
        const client = await oidc.Client.find(params.client_id as string);
        const state = params.state;
        const credentialRequest = params.request;

        // params returns
        // {
        //   client_id: 'f1ece6ac-973f-424b-b929-2e64033f9772',
        //   code_challenge: '1234567890123456789012345678901234567890123456',
        //   code_challenge_method: 'plain',
        //   nonce: '43747d5962a5',
        //   redirect_uri: 'https://jwt.io',
        //   response_type: 'code',
        //   scope: 'openid openid_credential',
        //   claims: '{"userinfo":{"given_name":{"essential":true},"nickname":null,"email":{"essential":true},"email_verified":{"essential":true},"picture":null},"id_token":{"gender":null,"birthdate":{"essential":true},"acr":{"values":["urn:mace:incommon:iap:silver"]}}}'
        // }


        // fetch OpenId Configuration
        const openIdConfigUrl = issuer?.federatedProvider?.url;
        const openIdConfig = openIdConfigUrl && (await fetchOpenIdConfiguration(openIdConfigUrl));

        if (!openIdConfig) return next(new Error('missing openid-configuration'));

        // redirect to federatedProvider
        if (prompt.name === 'login') {
          const loginUrl = openIdConfig[CONIG.AUTH];
          const response_type = 'code';
          const client_id = issuer.federatedProvider.clientId;
          const redirect_uri = issuer.federatedProvider.callbackUrl;

          // this scope is default scope, used in Auth0.com
          const scope = 'openid%20profile%20email';

          // uid (session id) is used as state
          const url = `${loginUrl}?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;
          res.writeHead(Status.FOUND, { Location: url });
          res.end();
        } else {
          // todo: XXXXXX, Grant is checked before calling it

          /**
           * Authorize will render screen to Grant Access, after login successfully
           */
          res.render('interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
            issuerId,
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
        const oidc = tenantManger.createOrGetOidcProvider(req.hostname, req.tenantId, issuerId);
        const interactionDetails = await oidc.interactionDetails(req, res);
        // returnTo:
        //   'https://issuer.example.com/oidc/issuers/bb41301f-0fc6-406d-ac34-3afeb003769e/auth/h_2x-LM_dtOMWwMbaMT0z',
        // prompt: {
        //   name: 'consent',
        //     reasons: [ 'op_scopes_missing', 'op_claims_missing' ],
        //     details: { missingOIDCScope: [Array], missingOIDCClaims: [Array] }
        // },
        // params: {
        //   client_id: '2843faca-8911-45ac-b605-f15c5556b88e',
        //     code_challenge: '1234567890123456789012345678901234567890123456',
        //     code_challenge_method: 'plain',
        //     nonce: 'foobar',
        //     redirect_uri: 'https://jwt.io',
        //     response_type: 'code id_token token',
        //     scope: 'openid email profile',
        //     claims: '{ "userinfo": { "email": { "essential": true } }, "id_token": { "email": { "essential": true } } }',
        //     did: 'did:web:issuer.example.com'
        // },
        debug('POST /oidc/issuers/:issuer_id/interaction/%s/confirm', interactionDetails.uid);
        debug('%O', interactionDetails);

        const {
          prompt: { name, details },
          params,
          session: { accountId },
        } = interactionDetails;

        assert.strictEqual(name, 'consent');

        let { grantId } = interactionDetails;
        let grant;

        if (grantId) {
          // we'll be modifying existing grant in existing session
          grant = await oidc.Grant.find(grantId);
        } else {
          // we're establishing a new grant
          grant = new oidc.Grant({
            accountId,
            clientId: params.client_id as string,
          });
        }

        if (details.missingOIDCScope) {
          grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '));
          // use grant.rejectOIDCScope to reject a subset or the whole thing
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims as any);
          // use grant.rejectOIDCClaims to reject a subset or the whole thing
        }
        if (details.missingResourceScopes) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
            grant.addResourceScope(indicator, scopes.join(' '));
            // use grant.rejectResourceScope to reject a subset or the whole thing
          }
        }

        grantId = await grant.save();

        const consent: any = {};
        if (!interactionDetails.grantId) {
          // we don't have to pass grantId to consent, we're just modifying existing one
          consent.grantId = grantId;
        }

        const result = { consent };

        // todo: issuer verifiable credential here

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
        const oidc = tenantManger.createOrGetOidcProvider(req.hostname, req.tenantId, issuerId);
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
  router.use('/issuers', createOidcIssuerRoute());

  /**
   * @see https://mattrglobal.github.io/oidc-client-bound-assertions-spec/#name-credential-endpoint-request
   */
  router.post('/issuers/:id/credential', async (req: RequestWithVhost, res) => {
    const issuerId = req.params.id;
    const credentailRequest: string | undefined = req.body?.request;
    const clientId = req.body?.client_id as string;

    // TODO Verifiy access token

    if (!credentailRequest)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'request not found' });

    let payload: unknown;
    try {
      // decode signed-jwt-request-obj
      // payload = jwt_decode(credentailRequest);
      const publicKey = createPublicKey(fs.readFileSync('./certs/host.pem'));
      const { payload, protectedHeader }: JWTVerifyResult = await jwtVerify(
        credentailRequest,
        publicKey,
        {
          issuer: `urn:wallet:${clientId}`,
          audience: `urn:issuer:${issuerId}`,
        }
      );

      console.log(payload);

      // if (isCredentialRequestPayload(payload)) {
      //   // check signature
      //   console.log(payload);
      // }
      // TODO: Dummy code
      res.send(Status.OK).send({ data: 'ok' });
    } catch (error) {
      console.warn(error);
    }
  });

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

    const oidc = tenantManger.createOrGetOidcProvider(req.hostname, req.tenantId, issuerId);

    debug('at /oidc/issuers/:issuer_id, %s', issuerId);

    return oidc
      ? oidc.callback()(req, res)
      : res.status(Status.BAD_REQUEST).send({ error: 'Oidc provider not found' });
  });

  return router;
};

import assert from 'assert';
import Debug from 'debug';
import { Request, Router, Response, NextFunction } from 'express';
import { Provider } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { Tenant } from '../entities';
import { createOidcClientRoute } from './createOidcClientRoute';
import { createOidcIssuerRoute } from './createOidcIssuerRoute';
import { createOidcProviderConfig } from './createOidcProviderConfig';

interface RequestWithVhost extends Request {
  vhost?: any;
  issuerId?: string;
  tenantId?: string;
}

const debug = Debug('utils:createOidcRoute');

// TODO: fix it
const issuerUrl = 'http://issuer.example.com';
const setNoCache = (req: Request, res: Response, next: NextFunction) => {
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store');
  next();
};

export const createOidcRoute = () => {
  const router = Router();
  const tenantRepo = getConnection('default').getRepository(Tenant);
  const oidc = new Provider(issuerUrl, createOidcProviderConfig());

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

  // Todo: This is Incorrect implementation
  router.get('/login', async (_, res) => {
    const tenant = 'https://dashslab.us.auth0.com/authorize';
    const response_type = 'code';
    const client_id = process.env.AUTH0_ID;
    const redirect_uri = 'http://localhost:3000/api/auth/callback/auth0';
    const scope = 'openid%20profile%20email';
    const state = '123';
    const url = `${tenant}?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;

    res.writeHead(302, { Location: url });
    res.end();
  });

  // parse issuer_id
  router.use(
    '/issuers/:issuer_id/clients',
    (req: RequestWithVhost, res, next) => {
      req.issuerId = req.params.issuer_id;
      next();
    },
    createOidcClientRoute()
  );

  // RESTful route
  router.use('/issuers', createOidcIssuerRoute());

  // kick off interaction
  router.get('/issuers/interaction/:uid', setNoCache, async (req, res, next) => {
    try {
      const details = await oidc.interactionDetails(req, res);

      // debug('see what else is available to you for interaction views');
      // debug('%O', details);

      const { uid, prompt, params } = details;
      const client = await oidc.Client.find(params.client_id as string);

      if (prompt.name === 'login') {
        return res.render('login', {
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Sign-in',
          flash: undefined,
        });
      }

      return res.render('interaction', {
        client,
        uid,
        details: prompt.details,
        params,
        title: 'Authorize',
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/issuers/interaction/:uid/login', setNoCache, async (req, res, next) => {
    try {
      const { uid, prompt, params } = await oidc.interactionDetails(req, res);
      assert.strictEqual(prompt.name, 'login');
      const client = await oidc.Client.find(params.client_id as string);

      // const accountId = await Account.authenticate(req.body.email, req.body.password);
      const accountId = '123';

      if (!accountId) {
        res.render('login', {
          client,
          uid,
          details: prompt.details,
          params: {
            ...params,
            login_hint: req.body.email,
          },
          title: 'Sign-in',
          flash: 'Invalid email or password.',
        });
        return;
      }

      const result = {
        login: { accountId },
      };

      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  router.post('/issuers/interaction/:uid/confirm', setNoCache, async (req, res, next) => {
    try {
      const interactionDetails = await oidc.interactionDetails(req, res);
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
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
      next(err);
    }
  });

  router.post('/issuers/interaction/:uid/abort', setNoCache, async (req, res, next) => {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  router.use('/issuers/:id', oidc.callback());

  return router;
};

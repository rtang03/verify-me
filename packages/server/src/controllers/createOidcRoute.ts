import Debug from 'debug';
import { Request, Router } from 'express';
import { ClientAuthMethod, Configuration, Provider, ResponseType } from 'oidc-provider';
import { Connection, getConnection } from 'typeorm';
import { Tenant } from '../entities';
import { createOidcIssuerRoute } from './createOidcIssuerRoute';

interface RequestWithVhost extends Request {
  vhost?: any;
  dbConnection?: Promise<Connection>;
  tenantId?: string;
}

const debug = Debug('utils:createOidcRoute');

const configuration: Configuration = {
  clients: [
    {
      client_id: 'foo',
      redirect_uris: ['https://jwt.io'], // using jwt.io as redirect_uri to show the ID Token contents
      response_types: ['id_token' as ResponseType],
      grant_types: ['implicit'],
      token_endpoint_auth_method: 'none' as ClientAuthMethod,
    },
  ],
  interactions: {
    url(ctx, interaction) {
      return `/interaction/${interaction.uid}`;
    },
  },
  cookies: {
    keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
  },
  claims: {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
    ],
  },
  features: {
    devInteractions: { enabled: false }, // defaults to true

    deviceFlow: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
  },
};

// TODO: fix it
const issuerUrl = 'http://issuer.example.com';

export const createOidcRoute = () => {
  const router = Router();
  const oidc = new Provider(issuerUrl, configuration);
  const tenantRepo = getConnection('default').getRepository(Tenant);

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

  router.use('/issuers', createOidcIssuerRoute());

  router.use(oidc.callback());

  return router;
};

import type { Configuration } from 'oidc-provider';
import { createOidcAdapter } from './createOidcAdapter';

export const createOidcProviderConfig = (connectionName: string) => {
  return <Configuration>{
    adapter: createOidcAdapter(connectionName),
    interactions: {
      url: (ctx, interaction) => {
        // See example
        // Interaction {
        //   iat: 1624974703,
        //   exp: 1624975703,
        //   returnTo:
        //     'https://issuer.example.com/oidc/issuers/bb41301f-0fc6-406d-ac34-3afeb003769e/auth/SbjO7-Sb7l2qgYUywXUgB',
        //   prompt: { name: 'login', reasons: ['no_session'], details: {} },
        //   params: {
        //     client_id: 'foo',
        //     nonce: 'foobar',
        //     redirect_uri: 'https://jwt.io',
        //     response_type: 'id_token',
        //     scope: 'openid',
        //   },
        //   kind: 'Interaction',
        //   jti: 'SbjO7-Sb7l2qgYUywXUgB',
        // };
        return `/oidc/issuers/interaction/${interaction.uid}`;
      },
    },
    cookies: {
      keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
    },
    // see https://github.com/panva/node-oidc-provider/tree/main/docs#findaccount
    findAccount: async (ctx, sub, token) => {
      return {
        accountId: sub,
        async claims(use, scope, claims, rejected) {
          return { sub, email: 'tangross@hotmail.com', email_verified: false };
        },
      };
    },
    claims: {
      email: ['email', 'email_verified'],
      openid: ['sub'],
    },
    features: {
      devInteractions: { enabled: false }, // defaults to true
      deviceFlow: { enabled: true }, // defaults to false
      revocation: { enabled: true }, // defaults to false
      registration: { enabled: true },
    },
    ttl: {
      AuthorizationCode: 600 /* 10 minutes in seconds */,
      DeviceCode: 600 /* 10 minutes in seconds */,
      Grant: 1209600 /* 14 days in seconds */,
      IdToken: 3600 /* 1 hour in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1209600 /* 14 days in seconds */,
    },
    acrValues: ['0'],
    scopes: ['openid', 'offline_access'],
    pkce: {
      methods: ['plain'],
      pkceRequired: (ctx, client) => true,
    },
  };
};

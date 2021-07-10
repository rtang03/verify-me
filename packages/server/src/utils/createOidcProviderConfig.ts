import type { Configuration } from 'oidc-provider';
import { createOidcAdapter } from './createOidcAdapter';

export const createOidcProviderConfig = (connectionName: string, issuerId: string) => {
  return <Configuration>{
    acrValues: ['0'],
    adapter: createOidcAdapter(connectionName),
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
      openid: ['sub'],
    },
    conformIdTokenClaims: true,
    cookies: {
      keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
    },
    extraParams: ['did'],
    extraTokenClaims: (ctx, token) => {
      // add to accessToken via resource indicator
      return {
        'urn:oidc-provider:example:foo': 'bar',
      };
    },
    // see https://github.com/panva/node-oidc-provider/tree/main/docs#findaccount
    findAccount: async (ctx, sub, token) => {
      return {
        accountId: sub,
        claims: async (use, scope, claims, rejected) => {
          // id_token will return only sub
          // console.log('claims: ', claims);
          // claims:  { email: { essential: true } }
          return { sub };
        },
      };
    },
    features: {
      claimsParameter: { enabled: true }, // defaults to false
      devInteractions: { enabled: false }, // defaults to true
      deviceFlow: { enabled: true }, // defaults to false
      registration: { enabled: true },
      resourceIndicators: {
        enabled: false,
        // defaultResource: async (ctx) => {
        //   return undefined;
        // },
        // getResourceServerInfo: async (ctx, resourceIndicator, client) => {
        //   return {
        //     scope: 'oidc oidc_credential',
        //     audience: client.clientId,
        //     accessTokenTTL: 2 * 60 * 60, // 2 hours
        //     accessTokenFormat: 'jwt',
        //     jwt: { sign: { alg: 'RS256' } },
        //   };
        // },
        // useGrantedResource: async (ctx, model) => {
        //   return true;
        // },
      },
      revocation: { enabled: true }, // defaults to false
      userinfo: { enabled: true },
    },
    interactions: {
      url: (ctx, interaction) => `/oidc/issuers/${issuerId}/interaction/${interaction.uid}`,
    },
    ttl: {
      AuthorizationCode: 600 /* 10 minutes in seconds */,
      DeviceCode: 600 /* 10 minutes in seconds */,
      Grant: 1209600 /* 14 days in seconds */,
      IdToken: 3600 /* 1 hour in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1209600 /* 14 days in seconds */,
    },
    pkce: {
      methods: ['S256', 'plain'],
      pkceRequired: (ctx, client) => true,
    },
    responseTypes: [
      'code',
      'id_token',
      'id_token token',
      'code id_token',
      'code token',
      'code id_token token',
      'none',
    ],
    scopes: ['openid', 'offline_access', 'oidc_credential'],
  };
};

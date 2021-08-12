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
      ciba: {
        ack: undefined,
        deliveryModes: ['poll'],
        enabled: false,
        processLoginHint: async (ctx, loginHint) => {
          // @param ctx - koa request context
          // @param loginHint - string value of the login_hint parameter
          throw new Error('features.ciba.processLoginHint not implemented');
        },
        processLoginHintToken: async (ctx, loginHintToken) => {
          // @param ctx - koa request context
          // @param loginHintToken - string value of the login_hint_token parameter
          throw new Error('features.ciba.processLoginHintToken not implemented');
        },
        triggerAuthenticationDevice: async (ctx, request, account, client) => {
          // @param ctx - koa request context
          // @param request - the BackchannelAuthenticationRequest instance
          // @param account - the account object retrieved by findAccount
          // @param client - the Client instance
          throw new Error('features.ciba.triggerAuthenticationDevice not implemented');
        },
        validateBindingMessage: async (ctx, bindingMessage) => {
          // @param ctx - koa request context
          // @param bindingMessage - string value of the binding_message parameter, when not provided it is undefined
          // if (bindingMessage && !/^[a-zA-Z0-9-._+/!?#]{1,20}$/.exec(bindingMessage)) {
          //   throw new errors.InvalidBindingMessage(
          //     'the binding_message value, when provided, needs to be 1 - 20 characters in length and use only a basic set of characters (matching the regex: ^[a-zA-Z0-9-._+/!?#]{1,20}$ )'
          //   );
          // }
        },
        validateRequestContext: async (ctx, requestContext) => {
          // @param ctx - koa request context
          // @param requestContext - string value of the request_context parameter, when not provided it is undefined
          throw new Error('features.ciba.validateRequestContext not implemented');
        },
        // verifyUserCode: async (ctx, account, userCode) => {
        //   // @param ctx - koa request context
        //   // @param account -
        //   // @param userCode - string value of the user_code parameter, when not provided it is undefined
        //   throw new Error('features.ciba.verifyUserCode not implemented');
        // },
      },
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
    discovery: {
      // issuer expressing support for did
      dids_supported: true,
      did_methods_supported: ['did:"web'],
      // issuer advertising support for issuing credentials
      credential_supported: true,
      credential_formats_supports: ['jwt'],
      // information about credential the issuer offer
      credential_claims_supported: [
        'given_name',
        'last_name',
        'https://www.w3.org/2018/credentials/examples/v1/degree',
      ],
      credential_name: 'University Credential',
    },
  };
};

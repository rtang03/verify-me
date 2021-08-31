import type { Configuration, JWK } from 'oidc-provider';
import { createOidcAdapter } from './createOidcAdapter';

export const createOidcProviderConfig = (
  connectionName: string,
  issuerId: string,
  jwks: { keys: JWK[] }
) => {
  return <Configuration>{
    jwks,
    acrValues: ['0'],
    adapter: createOidcAdapter(connectionName),
    claims: {
      // NOTE: All other scopes are disabled. The oidc-bridge replaces the default scope "email profile" from "openid_credential"
      // Below scope can REMOVE
      // address: ['address'],
      // email: ['email', 'email_verified'],
      // phone: ['phone_number', 'phone_number_verified'],
      // profile: [
      //   'birthdate',
      //   'family_name',
      //   'gender',
      //   'given_name',
      //   'locale',
      //   'middle_name',
      //   'name',
      //   'nickname',
      //   'picture',
      //   'preferred_username',
      //   'profile',
      //   'updated_at',
      //   'website',
      //   'zoneinfo',
      // ],
      // New scope "openid_credential"
      openid_credential: [],
      openid: ['sub'],
    },
    conformIdTokenClaims: true,
    cookies: {
      keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
    },
    // NOTE: did is not currently used. Can remove. The did is retrived from Oidc-client record, instead of signed request object
    extraParams: ['did', 'sub_jwk', 'credential_format'],
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
      // claimsParameter: { enabled: true }, // defaults to false
      devInteractions: { enabled: false }, // defaults to true
      deviceFlow: { enabled: true }, // defaults to false
      registration: { enabled: false },
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
      // Todo: may need to disable userInfo endpoint, while it is replaced by /credential endpoint
      userinfo: { enabled: true },
      requestObjects: {
        mode: 'lax',
        request: true,
        requestUri: false,
        requireUriRegistration: false,
        requireSignedRequestObject: true,
      },
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
      // ❓TODO: change from interaction.uid to interaction.jti ..... NOT sure if this correct. Need revisit
      url: (ctx, interaction) => `/oidc/issuers/${issuerId}/interaction/${interaction.jti}`,
    },
    ttl: {
      AuthorizationCode: 7200 /* 2 hours */,
      Grant: 1209600 /* 14 days in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1209600 /* 14 days in seconds */,
      // IdToken: 7200 /* 2 hour in seconds */,
      // DeviceCode: 600 /* 10 minutes in seconds */,
    },
    pkce: {
      methods: ['S256', 'plain'],
      pkceRequired: (ctx, client) => true,
    },
    // NOTE: id_token may be REMOVE. Should use access_token to fetch /credential endpoint instead.
    responseTypes: [
      'code',
      'code token',
      'id_token',
      'id_token token',
      'code id_token',
      'code id_token token',
      // 'none',
    ],
    scopes: ['openid', 'offline_access', 'openid_credential'],
    // see full example for discovery: https://learn.mattr.global/api-reference/v1.0.1#operation/issuerWellKnownOidcConfig
    // standard params: https://openid.net/specs/openid-connect-discovery-1_0.html
    discovery: {
      // issuer expressing support for did
      dids_supported: true,
      did_methods_supported: ['did:"web'],
      // issuer advertising support for issuing credentials
      credential_supported: true,
      credential_formats_supports: ['jwt', 'w3cvc-jsonld'],
      // information about credential the issuer offer
      // TODO: should be refactored, based on OidcIssuer's claim mapping
      credential_claims_supported: [
        'given_name',
        'last_name',
        'https://www.w3.org/2018/credentials/examples/v1/degree',
      ],
      credential_name: 'University Credential',
      credential_endpoint: `https://issuer.example.com/oidc/issuers/${issuerId}/credential`,
      request_parameter_supported: true,
      require_signed_request_object: true,
    },
    enabledJWA: {
      requestObjectSigningAlgValues: ['EdDSA'],
    },
  };
};

import { Credential } from '@veramo/data-store';
import Debug from 'debug';
import type { Configuration, JWK } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { createOidcAdapter } from './createOidcAdapter';
import { ClaimMapping, getClaimMappings } from './oidcProfileClaimMappings';

const debug = Debug('utils:createOidcProviderConfig');

export const createOidcProviderConfig = (
  connectionName: string,
  issuerId: string,
  jwks: { keys: JWK[] },
  // claimMappings includes user-defined claims; not including "email", "address", "phone", "profile"
  claimMappings: ClaimMapping[]
) => {
  const { supportedClaims } = getClaimMappings(claimMappings);

  return <Configuration>{
    jwks,
    acrValues: ['0'],
    adapter: createOidcAdapter(connectionName),
    // IMPORTANT: whitelist claims, which will prompt for "Authorize"
    claims: {
      openid_credential: supportedClaims,
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
      openid: ['sub', 'verifiable_credential', 'sub_jwk'],
    },
    conformIdTokenClaims: true,
    cookies: {
      keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
    },
    // NOTE: did is not currently used. Can remove. The did is retrived from Oidc-client record, instead of signed request object
    extraParams: ['did', 'sub_jwk', 'credential_format'],
    // see https://github.com/panva/node-oidc-provider/tree/main/docs#findaccount
    findAccount: async (ctx, sub, token) => {
      // DEBUG: token should look like
      // const token = {
      //   grantId: 'voS8hGHiiu0iprDm6Hu9omPfBLLwKGuxHmai9HXhVsw',
      //   iat: 1630482321,
      //   exp: 1630489521,
      //   accountId: 'auth0|6059aed4aa7803006a20d824',
      //   acr: '0',
      //   authTime: 1630482321,
      //   claims: {
      //     userinfo: {
      //       email: null,
      //       name: null,
      //       'https://tenant.vii.mattr.global/educationalCredentialAwarded': null,
      //     },
      //     id_token: {
      //       acr: null,
      //       email: null,
      //       name: null,
      //       'https://tenant.vii.mattr.global/educationalCredentialAwarded': null,
      //     },
      //   },
      //   codeChallenge: 'wZWSwx5VuSr4bntqXF6IMSaoAEfIxwVpomrqz_bxDgw',
      //   codeChallengeMethod: 'S256',
      //   nonce: 'nZ-SFtH1ave5FrHTQqWvPyU5Rjpdbuf607YUbHLLSIY',
      //   redirectUri: 'https://jwt.io',
      //   scope: 'openid openid_credential',
      //   sessionUid: 'W8r424nGw_fAoEBlGYGWO',
      //   clientId: 'V1StGXR8_Z5jdHi6B-myT',
      //   expiresWithSession: true,
      //   kind: 'AuthorizationCode',
      //   jti: 'X-_r8qFHubzBswg55BBzA8Gbx_puyziQwo93n8nqWAD',
      // };

      return {
        accountId: sub,
        claims: async (use, scope, claims, rejected) => {
          // construct id_token or userInfo by appending VP
          // see https://openid.net/specs/openid-connect-4-verifiable-presentations-1_0.html

          // retrieve VC
          const credentialRepo = await getConnection(connectionName).getRepository(Credential);
          const credential = await credentialRepo.findOne(
            { id: token.grantId },
            { relations: ['subject'] }
          );

          if (!credential) throw new Error('fail to create id_token / userinfo; no cred found');

          const result = { sub: credential.subject?.did };
          scope.includes('openid_credential') &&
            credential &&
            (result['verifiable_credential'] = (credential as any)._raw);

          return result;
        },
      };
    },
    features: {
      claimsParameter: { enabled: true }, // must be true
      devInteractions: { enabled: false }, // defaults to true
      registration: { enabled: false }, // use Oidc-client POST endpoint instead
      revocation: { enabled: true }, // defaults to false
      userinfo: { enabled: true },
      // TODO: seems not working
      jwtUserinfo: { enabled: true },
      requestObjects: {
        mode: 'lax',
        request: true,
        requestUri: false,
        requireUriRegistration: false,
        requireSignedRequestObject: true,
      },
      fapi: { enabled: true, profile: '1.0 Final' },
      // oidc-provider NOTICE: - JWT Secured Authorization Response Mode for OAuth 2.0 - Implementer's Draft 01 (This is an OIDF FAPI WG Implementer's Draft. URL: https://openid.net/specs/openid-financial-api-jarm-ID1.html.
      jwtResponseModes: { ack: 'implementers-draft-01', enabled: true },
      // https://github.com/panva/node-oidc-provider/tree/main/docs#featuresciba
      ciba: {
        deliveryModes: ['poll', 'ping'],
        enabled: false,
        // Helper function used to process the login_hint parameter and return the accountId value to use for processsing the request.
        processLoginHint: async (ctx, loginHint) => {
          // @param ctx - koa request context
          // @param loginHint - string value of the login_hint parameter
          throw new Error('features.ciba.processLoginHint not implemented');
        },
        // Helper function used to process the login_hint_token parameter and return the accountId value to use for processsing the request
        processLoginHintToken: async (ctx, loginHintToken) => {
          // @param ctx - koa request context
          // @param loginHintToken - string value of the login_hint_token parameter
          throw new Error('features.ciba.processLoginHintToken not implemented');
        },
        // Helper function used to trigger the authentication and authorization on end-user's Authentication Device. It is called after
        // accepting the backchannel authentication request but before sending client back the response.
        // When the end-user authenticates use provider.backchannelResult() to finish the Consumption Device login process.
        triggerAuthenticationDevice: async (ctx, request, account, client) => {
          // @param ctx - koa request context
          // @param request - the BackchannelAuthenticationRequest instance
          // @param account - the account object retrieved by findAccount
          // @param client - the Client instance
          throw new Error('features.ciba.triggerAuthenticationDevice not implemented');
        },
        // Helper function used to process the binding_message parameter and throw if its not following the authorization server's policy.
        validateBindingMessage: async (ctx, bindingMessage) => {
          // @param ctx - koa request context
          // @param bindingMessage - string value of the binding_message parameter, when not provided it is undefined
          if (bindingMessage && !/^[a-zA-Z0-9-._+/!?#]{1,20}$/.exec(bindingMessage)) {
            throw new Error(
              'the binding_message value, when provided, needs to be 1 - 20 characters in length and use only a basic set of characters (matching the regex: ^[a-zA-Z0-9-._+/!?#]{1,20}$ )'
            );
            // throw new errors.InvalidBindingMessage(
            //   'the binding_message value, when provided, needs to be 1 - 20 characters in length and use only a basic set of characters (matching the regex: ^[a-zA-Z0-9-._+/!?#]{1,20}$ )'
            // );
          }
        },
        // Helper function used to verify the user_code parameter value is present when required and verify its value.
        verifyUserCode: async (ctx, userCode) => {
          // @param ctx - koa request context
          // @param userCode - string value of the user_code parameter, when not provided it is undefined
          throw new Error('features.ciba.verifyUserCode not implemented');
        },
      },
      backchannelLogout: { enabled: false },
    },
    interactions: {
      // ❓TODO: change from interaction.uid to interaction.jti ..... NOT sure if this correct. Need revisit
      url: (ctx, interaction) => `/oidc/issuers/${issuerId}/interaction/${interaction.jti}`,
    },
    ttl: {
      AccessToken: 86400,
      AuthorizationCode: 7200 /* 2 hours */,
      Grant: 1209600 /* 14 days in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1209600 /* 14 days in seconds */,
      IdToken: 7200 /* 2 hour in seconds */,
      DeviceCode: 600 /* 10 minutes in seconds */,
    },
    pkce: {
      methods: ['S256'],
      pkceRequired: (ctx, client) => true,
    },
    // NOTE: id_token may be REMOVE. Should use access_token to fetch /credential endpoint instead.
    responseTypes: [
      'code',
      'code token',
      'id_token',
      'code id_token',
      'code id_token token',
      // 'id_token token',
      // 'none',
    ],
    scopes: ['openid', 'offline_access', 'openid_credential', 'profile', 'email', 'address'],
    // see full example for discovery: https://learn.mattr.global/api-reference/v1.0.1#operation/issuerWellKnownOidcConfig
    // standard params: https://openid.net/specs/openid-connect-discovery-1_0.html
    discovery: {
      dids_supported: true,
      did_methods_supported: ['did:web'],
      credential_supported: true,
      credential_formats_supports: ['jwt'], // ['jwt', 'w3cvc-jsonld'],
      credential_claims_supported: supportedClaims,
      request_parameter_supported: true,
      require_signed_request_object: true,
      // backchannel_user_code_parameter_supported: false,
      // backchannel_token_delivery_modes_supported: ['poll'],
      // backchannel_authentication_request_signing_alg_values_supported: ['ES256K'],
    },
    enabledJWA: {
      requestObjectSigningAlgValues: ['ES256K'],
      idTokenSigningAlgValues: ['ES256K'],
      authorizationSigningAlgValues: ['ES256K'],
      userinfoSigningAlgValues: ['ES256K'],
    },
    tokenEndpointAuthMethods: ['client_secret_jwt', 'client_secret_post', 'private_key_jwt'],
  };
};

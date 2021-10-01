import { Credential } from '@veramo/data-store';
import Debug from 'debug';
import type { Configuration, JWK } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { createOidcAdapter } from './createOidcAdapter';
import { ClaimMapping, getClaimMappings } from './oidcProfileClaimMappings';

const debug = Debug('utils:createOidcProviderConfig');

// Provider Configuration for Issuer and Verifier are different.
// Issuer: authorization_code
// Verifier: ciba
export const createOidcProviderConfig = (option: {
  connectionName: string;
  issuerId?: string;
  verifierId?: string;
  jwks: { keys: JWK[] };
  // claimMappings includes user-defined claims; not including "email", "address", "phone", "profile"
  claimMappings: ClaimMapping[];
  isIssuerOrVerifier: 'issuer' | 'verifier';
}) => {
  const { connectionName, isIssuerOrVerifier, claimMappings, issuerId, verifierId, jwks } = option;
  const { supportedClaims } = getClaimMappings(claimMappings);
  const isCiba = isIssuerOrVerifier === 'verifier';
  const commonConfiguration = {
    dids_supported: true,
    credential_formats_supports: ['jwt'], // ['jwt', 'w3cvc-jsonld'],
    credential_claims_supported: supportedClaims,
    request_parameter_supported: true,
    require_signed_request_object: true,
  };
  const discovery = isCiba
    ? {
        ...commonConfiguration,
        backchannel_user_code_parameter_supported: false,
        backchannel_token_delivery_modes_supported: ['poll'],
        backchannel_authentication_request_signing_alg_values_supported: ['ES256K'],
      }
    : commonConfiguration;

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
    // Function used to load an account and retrieve its available claims.
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

          // replace original sub to "did:key:z7r8....."
          const id_tokenOrUserInfo = { sub: credential.subject?.did };
          scope.includes('openid_credential') &&
            credential &&
            (id_tokenOrUserInfo['verifiable_credential'] = (credential as any)._raw);

          return id_tokenOrUserInfo;
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
        enabled: isCiba,
        validateRequestContext: async (ctx, requestContext) => {
          // currently, requestContext is undefined. Not knowing how it is used.
          return;
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
        // Helper function used to process the login_hint parameter and return the accountId value to use for processsing the request.
        // A hint regarding the end-user for whom authentication is being requested. The value may contain an email address, phone number,
        // account number, subject identifier, username, etc., which identifies the end-user to the OP. The value may be directly
        // collected from the user by the Client before requesting authentication at the OP, for example, but may also be obtained by other means.
        processLoginHint: async (ctx, loginHint) => {
          // @param ctx - koa request context
          // @param loginHint - string value of the login_hint parameter
          // auth0|6059aed4aa7803006a20d824 or DID ???
          return 'auth0|6059aed4aa7803006a20d824';
        },
        // Helper function used to process the login_hint_token parameter and return the accountId value to use for processsing the request
        // processLoginHintToken: async (ctx, loginHintToken) => {
        //   // @param ctx - koa request context
        //   // @param loginHintToken - string value of the login_hint_token parameter
        //   throw new Error('features.ciba.processLoginHintToken not implemented');
        // },
        // Helper function used to verify the user_code parameter value is present when required and verify its value.
        verifyUserCode: async (ctx, userCode) => {
          // @param ctx - koa request context
          // @param userCode - string value of the user_code parameter, when not provided it is undefined

          // userCode returns
          // { accountId: 'abcdefg', claims: [AsyncFunction: claims] }

          // throw new Error('features.ciba.verifyUserCode not implemented');
          return;
        },
        // Helper function used to trigger the authentication and authorization on end-user's Authentication Device. It is called after
        // accepting the backchannel authentication request but before sending client back the response.
        // When the end-user authenticates use provider.backchannelResult() to finish the Consumption Device login process.
        triggerAuthenticationDevice: async (ctx, request, account, client) => {
          // @param ctx - koa request context
          // @param request - the BackchannelAuthenticationRequest instance
          // @param account - the account object retrieved by findAccount
          // @param client - the Client instance

          // e.g.
          // const request: BackchannelAuthenticationRequest = {
          //   accountId: 'auth0|6059aed4aa7803006a20d824',
          //   claims: {
          //     userinfo: {
          //       email: [Object],
          //       email_verified: null,
          //       name: null,
          //       'https://tenant.vii.mattr.global/educationalCredentialAwarded': [Object]
          //     },
          //     id_token: {
          //       auth_time: [Object],
          //       email: [Object],
          //       email_verified: null,
          //       'https://tenant.vii.mattr.global/educationalCredentialAwarded': [Object]
          //     }
          //   },
          //   nonce: undefined,
          //   params: {
          //     login_hint: 'I am dgPXxUz_6fWIQBD8XmiSy',
          //     scope: 'openid',
          //     claims: '{"userinfo":{"email":{"essential":true},"email_verified":null,"name":null,"https://tenant.vii.mattr.global/educationalCredentialAwarded":{"essential":true}},"id_token":{"auth_time":{"essential":true},"email":{"essential":true},"email_verified":null,"https://tenant.vii.mattr.global/educationalCredentialAwarded":{"essential":true}}}',
          //     binding_message: 'W4SCT'
          //   },
          //   scope: 'openid',
          //   kind: 'BackchannelAuthenticationRequest',
          //   jti: '3Kn3OsgW_4VVxhsaXK5JT_cFmT5lUWfc_YPKOuScV_r',
          //   clientId: 'V1StGXR8_Z5jdHi6B-myT',
          //   expiresIn: 3600
          // }
          // account = {
          //   accountId: 'auth0|6059aed4aa7803006a20d824',
          //   claims: [AsyncFunction: claims]
          // }
          // client = {
          //   applicationType: 'web',
          //   grantTypes: ['urn:openid:params:grant-type:ciba'],
          //   idTokenSignedResponseAlg: 'ES256K',
          //   postLogoutRedirectUris: [],
          //   requireAuthTime: false,
          //   responseTypes: [],
          //   subjectType: 'public',
          //   tokenEndpointAuthMethod: 'client_secret_post',
          //   revocationEndpointAuthMethod: 'client_secret_post',
          //   requireSignedRequestObject: true,
          //   authorizationSignedResponseAlg: 'ES256K',
          //   backchannelUserCodeParameter: false,
          //   clientId: 'V1StGXR8_Z5jdHi6B-myT',
          //   clientName: 'Oidc client for wallet',
          //   clientSecret: '123456123456123456123456',
          //   jwks: { keys: [[Object]] },
          //   redirectUris: ['https://jwt.io'],
          //   backchannelTokenDeliveryMode: 'poll',
          // };

          // throw new Error('features.ciba.triggerAuthenticationDevice not implemented');
          return;
          // auth_req_id is equal to jti, of signed request object
          // {
          //   "expires_in": 3600,
          //   "auth_req_id": "ZM45o9RWfREj_MxEs_Vg9iheHl2bj2EFegEiyEmx2Wo"
          // }
        },
      },
      backchannelLogout: { enabled: false },
    },
    interactions: {
      // ❓TODO: change from interaction.uid to interaction.jti ..... NOT sure if this correct. Need revisit
      url: (ctx, interaction) =>
        isIssuerOrVerifier === 'issuer'
          ? `/oidc/issuers/${issuerId}/interaction/${interaction.jti}`
          : `/oidc/verifiers/${verifierId}/interaction/${interaction.jti}`,
    },
    ttl: {
      AccessToken: 86400,
      AuthorizationCode: 7200 /* 2 hours */,
      Grant: 1209600 /* 14 days in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1209600 /* 14 days in seconds */,
      IdToken: 7200 /* 2 hour in seconds */,
      DeviceCode: 600 /* 10 minutes in seconds */,
      BackchannelAuthenticationRequest: 3600,
    },
    pkce: {
      methods: ['S256'],
      pkceRequired: (ctx, client) => true,
    },
    // NOTE: id_token may be REMOVE. Should use access_token to fetch /credential endpoint instead.
    responseTypes: ['code', 'code token', 'id_token', 'code id_token', 'code id_token token'],
    scopes: ['openid' /* 'offline_access'*/, 'openid_credential', 'profile', 'email', 'address'],
    // see full example for discovery: https://learn.mattr.global/api-reference/v1.0.1#operation/issuerWellKnownOidcConfig
    // standard params: https://openid.net/specs/openid-connect-discovery-1_0.html
    discovery,
    enabledJWA: {
      requestObjectSigningAlgValues: ['ES256K'],
      idTokenSigningAlgValues: ['ES256K'],
      authorizationSigningAlgValues: ['ES256K'],
      userinfoSigningAlgValues: ['ES256K'],
      tokenEndpointAuthSigningAlgValues: ['ES256K'],
    },
    tokenEndpointAuthMethods: ['client_secret_jwt', 'client_secret_post', 'private_key_jwt'],
    response_modes_supported: ['form_post', 'jwt'],
  };
};

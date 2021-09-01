import Debug from 'debug';
import type { Configuration, JWK } from 'oidc-provider';
import { createOidcAdapter } from './createOidcAdapter';
import { ClaimMapping, getClaimMappings } from './oidcProfileClaimMappings';

const debug = Debug('utils:createOidcProviderConfig');

export const createOidcProviderConfig = (
  connectionName: string,
  issuerId: string,
  jwks: { keys: JWK[] },
  claimMappings: ClaimMapping[]
) => {
  const { supportedClaims } = getClaimMappings(claimMappings);
  const claims = supportedClaims.reduce((prev, curr) => ({ ...prev, [curr]: null }), {});

  return <Configuration>{
    jwks,
    acrValues: ['0'],
    adapter: createOidcAdapter(connectionName),
    claims: {
      ...claims,
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
    conformIdTokenClaims: false,
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
      //   codeChallengeMethod: 'plain',
      //   nonce: 'nZ-SFtH1ave5FrHTQqWvPyU5Rjpdbuf607YUbHLLSIY',
      //   redirectUri: 'https://jwt.io',
      //   scope: 'openid',
      //   sessionUid: 'W8r424nGw_fAoEBlGYGWO',
      //   clientId: 'V1StGXR8_Z5jdHi6B-myT',
      //   expiresWithSession: true,
      //   kind: 'AuthorizationCode',
      //   jti: 'X-_r8qFHubzBswg55BBzA8Gbx_puyziQwo93n8nqWAD',
      // };

      return {
        accountId: sub,
        claims: async (use, scope, claims, rejected) => {
          debug('findAccount/use: %s', use);
          debug('findAccount/scope: %s', scope);
          debug('findAccount/claims: %O', claims);

          return {
            sub,
            // acr: '0',
            // email: 'any@example.com',
            // name: 'tester',
            // 'https://tenant.vii.mattr.global/educationalCredentialAwarded': 'student',
          };
        },
      };
    },
    features: {
      claimsParameter: { enabled: true }, // must be true
      devInteractions: { enabled: false }, // defaults to true
      registration: { enabled: false }, // use Oidc-client POST endpoint instead
      revocation: { enabled: true }, // defaults to false
      userinfo: { enabled: true },
      requestObjects: {
        mode: 'lax',
        request: true,
        requestUri: false,
        requireUriRegistration: false,
        requireSignedRequestObject: true,
      },
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
      methods: ['S256', 'plain'],
      pkceRequired: (ctx, client) => false,
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
    // Notes: there will be no missing-scope checking
    scopes: ['openid', 'profile', 'email', 'address'],
    // see full example for discovery: https://learn.mattr.global/api-reference/v1.0.1#operation/issuerWellKnownOidcConfig
    // standard params: https://openid.net/specs/openid-connect-discovery-1_0.html
    discovery: {
      // issuer expressing support for did
      dids_supported: true,
      did_methods_supported: ['did:"web'],
      credential_supported: true,
      credential_formats_supports: ['jwt'], // ['jwt', 'w3cvc-jsonld'],
      credential_claims_supported: supportedClaims,
      credential_name: 'University Credential',
      // credential_endpoint: `https://issuer.example.com/oidc/issuers/${issuerId}/credential`,
      request_parameter_supported: true,
      require_signed_request_object: true,
    },
    enabledJWA: {
      requestObjectSigningAlgValues: ['ES256K'],
      idTokenSigningAlgValues: ['ES256K'],
    },
  };
};

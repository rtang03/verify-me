import type { Configuration, JWK } from 'oidc-provider';
import { createOidcAdapter } from './createOidcAdapter';
import { ClaimMapping, getClaimMappings } from './oidcProfileClaimMappings';

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
      registration: { enabled: false },
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
      // 'code token',
      // 'id_token',
      // 'id_token token',
      // 'code id_token',
      // 'code id_token token',
      // 'none',
    ],
    // Notes: there will be no missing-scope checking
    scopes: ['openid' /* 'offline_access', 'profile', 'email', 'address', 'openid_credential' */],
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
      credential_claims_supported: supportedClaims,
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

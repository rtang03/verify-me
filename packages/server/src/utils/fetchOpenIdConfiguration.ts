import Debug from 'debug';
import Status from 'http-status';

const debug = Debug('utils:createOidcRoute');

export const CONIG = {
  AUTH: 'authorization_endpoint',
  ISSUER: 'issuer',
  TOKEN: 'token_endpoint',
  ME: 'userinfo_endpoint',
  JWKS: 'jwks_uri',
};

export const fetchOpenIdConfiguration = async (url: string) => {
  if (!url) {
    console.warn('no url found');
    return null;
  }

  try {
    const response = await fetch(`${url}/.well-known/openid-configuration`);
    if (response.status === Status.OK) {
      return await response.json();
    } else {
      const error = await response.text();
      console.error(error);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

// const openid = {
//   issuer: 'https://dashslab.us.auth0.com/',
//   authorization_endpoint: 'https://dashslab.us.auth0.com/authorize',
//   token_endpoint: 'https://dashslab.us.auth0.com/oauth/token',
//   device_authorization_endpoint: 'https://dashslab.us.auth0.com/oauth/device/code',
//   userinfo_endpoint: 'https://dashslab.us.auth0.com/userinfo',
//   mfa_challenge_endpoint: 'https://dashslab.us.auth0.com/mfa/challenge',
//   jwks_uri: 'https://dashslab.us.auth0.com/.well-known/jwks.json',
//   registration_endpoint: 'https://dashslab.us.auth0.com/oidc/register',
//   revocation_endpoint: 'https://dashslab.us.auth0.com/oauth/revoke',
//   scopes_supported: [
//     'openid',
//     'profile',
//     'offline_access',
//     'name',
//     'given_name',
//     'family_name',
//     'nickname',
//     'email',
//     'email_verified',
//     'picture',
//     'created_at',
//     'identities',
//     'phone',
//     'address',
//   ],
//   response_types_supported: [
//     'code',
//     'token',
//     'id_token',
//     'code token',
//     'code id_token',
//     'token id_token',
//     'code token id_token',
//   ],
//   code_challenge_methods_supported: ['S256', 'plain'],
//   response_modes_supported: ['query', 'fragment', 'form_post'],
//   subject_types_supported: ['public'],
//   id_token_signing_alg_values_supported: ['HS256', 'RS256'],
//   token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
//   claims_supported: [
//     'aud',
//     'auth_time',
//     'created_at',
//     'email',
//     'email_verified',
//     'exp',
//     'family_name',
//     'given_name',
//     'iat',
//     'identities',
//     'iss',
//     'name',
//     'nickname',
//     'phone_number',
//     'picture',
//     'sub',
//   ],
//   request_uri_parameter_supported: false,
// };

import type { ClaimsParameter } from 'oidc-provider';
import { PresentationRequest } from '../entities/PresentationRequest';

declare class BackchannelAuthenticationRequest {
  constructor(properties?: { clientId?: string | undefined; accountId?: string | undefined });

  readonly kind: 'BackchannelAuthenticationRequest';
  error?: string | undefined;
  errorDescription?: string | undefined;
  params?: any;
  accountId?: string | undefined;
  acr?: string | undefined;
  amr?: string[] | undefined;
  authTime?: number | undefined;
  claims?: ClaimsParameter | undefined;
  nonce?: string | undefined;
  resource?: string | string[] | undefined;
  scope?: string | undefined;
  sid?: string | undefined;
  sessionUid?: string | undefined;
  expiresWithSession?: boolean | undefined;
  grantId: string;
  consumed: unknown;

  static revokeByGrantId(grantId: string): Promise<void>;
}

export const oidcAuthReqToPresReq: (
  authRequest: BackchannelAuthenticationRequest
) => PresentationRequest = (authRequest) => {
  return null;
};

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

import type { JwtPayload } from 'jwt-decode';

export interface CredentialRequestPayload extends JwtPayload {
  // source: https://mattrglobal.github.io/oidc-client-bound-assertions-spec/#name-credential-endpoint-request
  sub_jwk?: any;
  credential_format?: string;
  nonce?: string;
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  // TODO: check if this is useful
  // source: https://medium.com/@CreatorNader/introducing-oidc-credential-provider-7845391a9881
  response_type?: string;
  client_id?: string;
  claims?: any;
  redirect_uri?: string;
}

// {
//   "aud": "https://issuer.example.com",
//   "iss": "https://wallet.example.com",
//   "sub": "urn:uuid:dc000c79-6aa3-45f2-9527-43747d5962a5",
//   "sub_jwk" : {
//   "crv":"secp256k1",
//     "kid":"YkDpvGNsch2lFBf6p8u3",
//     "kty":"EC",
//     "x":"7KEKZa5xJPh7WVqHJyUpb2MgEe3nA8Rk7eUlXsmBl-M",
//     "y":"3zIgl_ml4RhapyEm5J7lvU-4f5jiBvZr4KgxUjEhl9o"
// },
//   "credential_format": "w3cvc-jwt",
//   "nonce": "43747d5962a5",
//   "iat": 1591069056,
//   "exp": 1591069556
// }

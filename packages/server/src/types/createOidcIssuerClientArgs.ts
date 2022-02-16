import {
  ClientAuthMethod,
  ResponseType,
  SigningAlgorithmWithNone,
} from 'oidc-provider';

export type CreateOidcIssuerClientArgs = {
  client_name: string;
  redirect_uris?: string[];
  response_types?: ResponseType[];
  grant_types?: string[];
  token_endpoint_auth_method?: ClientAuthMethod;
  id_token_signed_response_alg?: SigningAlgorithmWithNone;
  application_type?: 'web' | 'native';
  jwks_uri?: string;
};

import {
  CIBADeliveryMode,
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
  backchannel_token_delivery_mode?: CIBADeliveryMode;
  backchannel_client_notification_endpoint?: string;
  backchannel_authentication_request_signing_alg?: string;
  jwks_uri?: string;
};

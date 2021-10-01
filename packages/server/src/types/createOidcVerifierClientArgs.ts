import {
  CIBADeliveryMode,
  ClientAuthMethod,
  SigningAlgorithmWithNone,
} from 'oidc-provider';

export type CreateOidcVerifierClientArgs = {
  client_name: string;
  grant_types?: string[];
  token_endpoint_auth_method?: ClientAuthMethod;
  id_token_signed_response_alg?: SigningAlgorithmWithNone;
  application_type?: 'web' | 'native';
  backchannel_token_delivery_mode?: CIBADeliveryMode;
  backchannel_client_notification_endpoint?: string;
  // backchannel_authentication_request_signing_alg?: string;
  jwks_uri?: string;
  redirect_uris: string[];
};

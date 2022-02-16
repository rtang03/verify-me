import type { IIdentifier } from '@veramo/core';
import { VerifiableCredential } from '@veramo/core';
import { OidcIssuer, Tenant, OidcClient, OidcVerifier } from '../entities';
import type {
  CreateOidcIssuerArgs,
  CreateOidcIssuerClientArgs,
  CreateOidcVerifierArgs,
  CreateOidcVerifierClientArgs,
  CredentialRequestPayload,
} from '../types';
import { CreatePresReqTemplArgs } from '../types';

export const isIdentitifer = (input: any): input is IIdentifier =>
  input.did !== undefined &&
  input.provider !== undefined &&
  input.keys !== undefined &&
  input.services !== undefined;

export const isVerifiableCredential = (input: any): input is VerifiableCredential =>
  input?.credentialSubject !== undefined &&
  input?.issuer !== undefined &&
  input?.type !== undefined &&
  input?.['@context'] !== undefined &&
  input?.issuanceDate !== undefined &&
  input?.proof !== undefined;

export const isTenant = (input: any): input is Tenant =>
  input?.slug !== undefined &&
  input?.id !== undefined &&
  input?.created_at !== undefined &&
  input?.updated_at !== undefined;

export const isCreateOidcIssuerArgs = (input: any): input is CreateOidcIssuerArgs =>
  input?.credential?.context !== undefined &&
  input?.credential?.name !== undefined &&
  input?.credential?.issuerDid !== undefined &&
  input?.credential?.type !== undefined &&
  input?.federatedProvider?.url !== undefined &&
  input?.federatedProvider?.scope !== undefined &&
  input?.federatedProvider?.clientId !== undefined &&
  input?.federatedProvider?.clientSecret !== undefined &&
  input?.claimMappings !== undefined;

export const isCreateOidcIssuerClientArgs = (input: any): input is CreateOidcIssuerClientArgs =>
  input?.client_name !== undefined &&
  input?.redirect_uris !== undefined &&
  input?.response_types !== undefined &&
  input?.grant_types !== undefined &&
  input?.token_endpoint_auth_method !== undefined &&
  input?.id_token_signed_response_alg !== undefined &&
  input?.application_type !== undefined;

export const isOidcIssuer = (input: any): input is OidcIssuer =>
  input?.id !== undefined &&
  input?.claimMappings !== undefined &&
  input?.credential !== undefined &&
  input?.federatedProvider !== undefined;

export const isOidcIssuerClient = (input: any): input is OidcClient =>
  input?.client_id !== undefined &&
  input?.client_secret &&
  input?.client_name &&
  input?.redirect_uris &&
  input?.response_types !== undefined &&
  input?.grant_types !== undefined &&
  input?.application_type !== undefined &&
  input?.token_endpoint_auth_method !== undefined &&
  input?.id_token_signed_response_alg !== undefined;

export const isCredentialRequestPayload = (input: any): input is CredentialRequestPayload =>
  input?.iss !== undefined &&
  input?.sub !== undefined &&
  input?.iat !== undefined &&
  input?.aud !== undefined;

export const isCreateOidcVerifierArgs = (input: any): input is CreateOidcVerifierArgs =>
  input?.presentationTemplateAlias !== undefined && input?.claimMappings !== undefined;

export const isCreateOidcVerifierClientArgs = (input: any): input is CreateOidcVerifierClientArgs =>
  input?.client_name !== undefined &&
  input?.grant_types !== undefined &&
  input?.token_endpoint_auth_method !== undefined &&
  input?.id_token_signed_response_alg !== undefined &&
  input?.application_type !== undefined &&
  input?.backchannel_token_delivery_mode !== undefined &&
  // input?.backchannel_authentication_request_signing_alg !== undefined &&
  input?.redirect_uris !== undefined;
// input?.response_types !== undefined;

export const isOidcVerifier = (input: any): input is OidcVerifier =>
  input?.id !== undefined &&
  input?.claimMappings !== undefined &&
  input?.did !== undefined &&
  input?.presentationTemplate?.id !== undefined;

export const isOidcVerifierClient = (input: any): input is OidcClient =>
  input?.client_id !== undefined &&
  input?.client_secret &&
  input?.client_name &&
  input?.grant_types !== undefined &&
  input?.application_type !== undefined &&
  input?.token_endpoint_auth_method !== undefined &&
  input?.id_token_signed_response_alg !== undefined &&
  input?.redirect_uris !== undefined &&
  input?.response_types !== undefined;

// todo: refine the claims array validation
export const isCreatePresReqTemplArgs = (input: any): input is CreatePresReqTemplArgs =>
  input?.claims !== undefined && input?.alias !== undefined;

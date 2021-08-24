import type { IIdentifier } from '@veramo/core';
import { VerifiableCredential } from '@veramo/core';
import { OidcIssuer, Tenant, OidcClient } from '../entities';
import type {
  CreateOidcIssuerArgs,
  CreateOidcIssuerClientArgs,
  CredentialRequestPayload,
} from '../types';

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

export const isOidcClient = (input: any): input is OidcClient =>
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

import type { IIdentifier } from '@veramo/core';
import { Credential } from '@veramo/data-store';
import { Tenant } from '../entities/Tenant';
import { CreateOidcIssuerArgs } from '../types/createOidcIssuerArgs';

export const isIdentitifer = (input: any): input is IIdentifier =>
  input.did !== undefined &&
  input.provider !== undefined &&
  input.keys !== undefined &&
  input.services !== undefined;

export const isCredential = (input: any): input is Credential =>
  input?.credentialSubject !== undefined &&
  input?.issuer !== undefined &&
  input?.type !== undefined &&
  input?.['@context'] !== undefined &&
  input?.issuanceDate !== undefined &&
  input?.proof !== undefined;

export const isTenant = (input: any): input is Tenant =>
  input?.slug !== undefined &&
  input?.id !== undefined &&
  input?.user_id !== undefined &&
  input?.created_at !== undefined &&
  input?.updated_at !== undefined &&
  input?.db_name !== undefined &&
  input?.db_host !== undefined &&
  input?.db_username !== undefined &&
  input?.db_password !== undefined &&
  input?.db_port !== undefined;

// Todo: full other condition later
export const isCreateOidcIssuerArgs = (input: any): input is CreateOidcIssuerArgs =>
  input?.credential?.name !== undefined;

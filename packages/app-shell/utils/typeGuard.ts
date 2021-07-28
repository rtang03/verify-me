import type { VerifiableCredential } from '@verify/server';

export const isVerifiableCredential = (input: any): input is VerifiableCredential =>
  input?.credentialSubject !== undefined &&
  input?.issuer !== undefined &&
  input?.type !== undefined &&
  input?.['@context'] !== undefined &&
  input?.issuanceDate !== undefined &&
  input?.proof !== undefined;

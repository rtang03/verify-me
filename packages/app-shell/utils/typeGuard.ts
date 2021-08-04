import type { VerifiableCredential } from '@verify/server';
import { VerifiablePresentation } from '@verify/server/dist/types';

export const isVerifiableCredential = (input: any): input is VerifiableCredential =>
  input?.credentialSubject !== undefined &&
  input?.issuer !== undefined &&
  input?.type !== undefined &&
  input?.['@context'] !== undefined &&
  input?.issuanceDate !== undefined &&
  input?.proof !== undefined;

export const isVerifiablePresentation = (input: any): input is VerifiablePresentation =>
  input?.holder !== undefined &&
  input?.['@context'] !== undefined &&
  input?.type !== undefined &&
  input?.verifier !== undefined &&
  input?.proof !== undefined;

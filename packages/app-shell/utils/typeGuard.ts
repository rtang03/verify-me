import type {
  VerifiableCredential,
  VerifiablePresentation,
  ISelectiveDisclosureRequest,
} from '@verify/server';

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

export const isSelectiveDisclosureRequest = (input: any): input is ISelectiveDisclosureRequest =>
  input?.iat !== undefined &&
  input?.iss !== undefined &&
  input?.type === 'sdr' &&
  input?.claims !== undefined;

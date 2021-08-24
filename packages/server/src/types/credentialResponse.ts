import { VerifiableCredential } from '@veramo/core';

export type CredentialResponse = {
  format: 'w3cvc-jsonld' | 'w3cvc-jwt';
  credential: VerifiableCredential;
};

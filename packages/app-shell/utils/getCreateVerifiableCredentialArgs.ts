import { ICreateVerifiableCredentialArgs } from '@veramo/credential-w3c';
import type { Claim } from '../types';
import { claimToObject } from './signing';

export const getCreateVerifiableCredentialArgs: (option: {
  credentialType: string;
  issuer: string;
  subject: string;
  claims: Claim[];
}) => ICreateVerifiableCredentialArgs = ({ credentialType, issuer, subject, claims }) => ({
  credential: {
    type: ['VerifiableCredential', credentialType],
    issuer: { id: issuer },
    credentialSubject: {
      id: subject,
      ...claimToObject(claims),
    },
  },
  proofFormat: 'jwt',
  save: true,
});



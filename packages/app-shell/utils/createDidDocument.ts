import type { VerificationMethod, ServiceEndpoint } from 'did-resolver';
import type { DidDocument } from '../types';
import { addressToDid } from './createKeyPair';

// @see https://w3c-ccg.github.io/ld-proofs/
export type LinkedDataProof = {
  type: string;
  created: string;
  nonce: string;
  proofPurpose?: string;
  verificationMethod?: string;
  domain?: string;
  signatureValue: string;
};

type CreateDidOption = {
  description?: string;
  context?: 'https://w3id.org/did/v1' | string | string[];
  id: string;
  controller?: string;
  controllerKey: string;
  service?: ServiceEndpoint[];
  created?: string;
  updated?: string;
  proof?: LinkedDataProof;
  keyAgreement?: (string | VerificationMethod)[];
};

export const createDidDocument: (option: CreateDidOption) => DidDocument = ({
  context,
  id,
  controller,
  controllerKey,
  service,
  created,
  updated,
  proof,
  keyAgreement,
  description,
}) => {
  context = context
    ? Array.isArray(context)
      ? [...context, 'https://www.w3.org/ns/did/v1']
      : [context, 'https://www.w3.org/ns/did/v1']
    : 'https://www.w3.org/ns/did/v1';

  if (!id) throw new Error('Cannot construct DID document without id or subject');

  const identity = addressToDid(id);
  const timestamp = Date.now();
  const isoTime = new Date(timestamp).toISOString();
  const authentication: string[] | VerificationMethod[] = [identity];
  const publicKey: VerificationMethod[] = [
    // sigAuth
    // {
    //   id: `${identity}`,
    //   type: 'Secp256k1SignatureAuthentication2018',
    //   publicKeyHex: controllerKey,
    //   controller: identity,
    // },
    // veriKey
    {
      id: `${identity}`,
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: controllerKey,
      controller: identity,
    },
  ];

  return {
    description,
    '@context': context,
    id: identity,
    controller: controller || identity,
    verificationMethod: publicKey,
    service,
    created: created ?? isoTime,
    updated: updated ?? isoTime,
    proof,
    keyAgreement,
  };
};

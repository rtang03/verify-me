import type { IIdentifier } from '@veramo/core';

export const createDidDocument = (identifier: IIdentifier) => ({
  '@context': 'https://w3id.org/did/v1',
  id: identifier.did,
  verificationMethod: identifier.keys.map((key) => ({
    id: identifier.did + '#' + key.kid,
    type:
      key.type === 'Secp256k1' ? 'EcdsaSecp256k1VerificationKey2019' : 'Ed25519VerificationKey2018',
    controller: identifier.did,
    publicKeyHex: key.publicKeyHex,
  })),
  authentication: identifier.keys.map((key) => `${identifier.did}#${key.kid}`),
  service: identifier.services,
});

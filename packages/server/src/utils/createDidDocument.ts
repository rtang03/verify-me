import type { IIdentifier, TKeyType} from '@veramo/core';

// export const createDidDocument = (identifier: IIdentifier) => ({
//   '@context': 'https://w3id.org/did/v1',
//   id: identifier.did,
//   verificationMethod: identifier.keys.map((key) => ({
//     id: identifier.did + '#' + key.kid,
//     type:
//       key.type === 'Secp256k1' ? 'EcdsaSecp256k1VerificationKey2019' : 'Ed25519VerificationKey2018',
//     controller: identifier.did,
//     publicKeyHex: key.publicKeyHex,
//   })),
//   authentication: identifier.keys.map((key) => `${identifier.did}#${key.kid}`),
//   service: identifier.services,
// });

// Refactor from https://github.com/uport-project/veramo/blob/next/packages/remote-server/src/web-did-doc-router.ts
// Note: this DidDocument defintition is instable api
const keyMapping: Record<TKeyType, string> = {
  Secp256k1: 'EcdsaSecp256k1VerificationKey2019',
  Ed25519: 'Ed25519VerificationKey2018',
  X25519: 'X25519KeyAgreementKey2019',
};

export const createDidDocument = (identifier: IIdentifier) => {
  const allKeys = identifier.keys.map((key) => ({
    id: identifier.did + '#' + key.kid,
    type: keyMapping[key.type],
    controller: identifier.did,
    publicKeyHex: key.publicKeyHex,
  }));
  // ed25519 keys can also be converted to x25519 for key agreement
  const keyAgreementKeyIds = allKeys
    .filter((key) => ['Ed25519VerificationKey2018', 'X25519KeyAgreementKey2019'].includes(key.type))
    .map((key) => key.id);
  const signingKeyIds = allKeys
    .filter((key) => key.type !== 'X25519KeyAgreementKey2019')
    .map((key) => key.id);

  return {
    '@context': 'https://w3id.org/did/v1',
    id: identifier.did,
    verificationMethod: allKeys,
    authentication: signingKeyIds,
    assertionMethod: signingKeyIds,
    keyAgreement: keyAgreementKeyIds,
    service: identifier.services,
  };
};

import * as u8a from 'uint8arrays';

// sample data
// const publicKeyHex = 'ad357fe82d6526b27625fca03a95ff27a9b5d1e828b4e60fc6dc0058520cd031';
// const privateKeyHex =
//   'add4fc5468bad60bc2d991f52dc0a5c9c6ce4667b0c9f92646f5386ce925d11aad357fe82d6526b27625fca03a95ff27a9b5d1e828b4e60fc6dc0058520cd031';

// see https://github.com/decentralized-identity/did-jwt/blob/7d0ef752e47f4b7fad8435c12a9ac0266aa6fa10/src/util.ts
export const convertKeyPairsToJwkEd22519 = (publicKeyHex: string, privateKeyHex: string) => {
  const x = u8a.toString(u8a.fromString(publicKeyHex.toLowerCase(), 'base16'), 'base64url');
  const d = u8a.toString(u8a.fromString(privateKeyHex.toLowerCase(), 'base16'), 'base64url');

  return {
    publicKeyJwk: { kty: 'OKP', crv: 'Ed25519', kid: publicKeyHex, x },
    privateKeyJwk: { kty: 'OKP', crv: 'Ed25519', kid: publicKeyHex, x, d },
  };
};

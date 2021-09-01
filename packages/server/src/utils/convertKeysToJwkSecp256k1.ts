import type { JWK } from 'jose/jwk/parse';
import * as u8a from 'uint8arrays';

export const convertKeysToJwkSecp256k1: (
  publicKeyHex: string,
  privateKeyHex?: string
) => { publicKeyJwk: JWK; privateKeyJwk?: JWK } = (publicKeyHex, privateKeyHex) => {
  const x = u8a.toString(
    u8a.fromString(publicKeyHex.toLowerCase(), 'base16').slice(1, 33),
    'base64url'
  );
  const y = u8a.toString(
    u8a.fromString(publicKeyHex.toLowerCase(), 'base16').slice(33, 66),
    'base64url'
  );
  const d =
    privateKeyHex &&
    u8a.toString(u8a.fromString(privateKeyHex.toLowerCase(), 'base16'), 'base64url');
  const kty = 'EC';
  const crv = 'secp256k1';
  const alg = 'ES256K';
  const kid = publicKeyHex;
  const use = 'sig';

  return privateKeyHex
    ? {
        publicKeyJwk: <JWK>{ kty, crv, alg, kid, x, y },
        privateKeyJwk: <JWK>{ kty, crv, use, alg, kid, x, y, d },
      }
    : {
        publicKeyJwk: <JWK>{ kty, crv, alg, kid, x, y },
      };
};

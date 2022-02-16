import { createHash, randomBytes } from 'crypto';
import base64url from 'base64url';

const random = (bytes = 32) => base64url(randomBytes(bytes));

// see https://github.com/panva/node-openid-client/blob/main/lib/helpers/generators.js
export const generators = {
  codeVerifier: random,
  codeChallenge: (codeVerifier: string) =>
    base64url(createHash('sha256').update(codeVerifier).digest()),
  nonce: random,
  state: random,
};

export default generators;

// import fs from 'fs';
// import path from 'path';
// import jose from 'jose2';
//
// const keystore = new jose.JWKS.KeyStore();
//
// (async () =>
//   Promise.all([
//     keystore.generate('RSA', 2048, { use: 'sig' }),
//     keystore.generate('EC', 'P-256', { use: 'sig', alg: 'ES256' }),
//     keystore.generate('OKP', 'Ed25519', { use: 'sig', alg: 'EdDSA' }),
//   ]).then(() => {
//     fs.writeFileSync(path.resolve('src/jwks.json'), JSON.stringify(keystore.toJWKS(true), null, 2));
//   }))();

import fs from 'fs';
import path from 'path';
import { fromKeyLike } from 'jose/jwk/from_key_like';
import { generateKeyPair } from 'jose/util/generate_key_pair';

(async () => {
  const privKeys = [
    { use: 'RS256', options: { crv: 'EC' } },
  ].map(({ use, options }) => generateKeyPair(use, options).then(({ privateKey }) => privateKey));
  const keys = [];
  for await (const key of privKeys) {
    keys.push(await fromKeyLike(key));
  }
  const jwks = { keys };
  fs.writeFileSync(path.resolve(`./certs/jwks.json`), JSON.stringify(jwks, null, 2));
  console.log(`${keys.length} key(s) generated.`);
})();

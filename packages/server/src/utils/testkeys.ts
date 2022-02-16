// const { parseJwk } = require('jose/jwk/parse');
// const publicBase58 = 'A77GCUCZ7FAuXVMKtwwXyFhMa158XsaoGKHYNnJ1q3pv';
// const privateKeyBase58 = 'BE1VM7rTRJReLsTLLG4JMNX5ozcp7qpmMuRht9zB1UjU';
// const jwk = {
//   kty: 'OKP',
//   crv: 'Ed25519',
//   alg: 'EdDSA',
//   kid: 'f39b43cef77e2acc4dc9d92bf6baafd60e3a1790bd599faa42b80476dbd4b832',
//   x: '85tDzvd-KsxNydkr9rqv1g46F5C9WZ-qQrgEdtvUuDI',
//   d: 'FxLgp_R2RvgJ0ExM09mgDoQSo9pPLOyYUkaCiu2voKfzm0PO934qzE3J2Sv2uq_WDjoXkL1Zn6pCuAR229S4Mg',
//   use: 'sig',
// };

import { convertKeysToJwkSecp256k1 } from './convertKeysToJwkSecp256k1';
import { createPrivateKey } from 'crypto';
import * as u8a from 'uint8arrays';

const publicKeyHex =
  '0484ac75f5e5842d12c1c0d19d3d389f9be5d6159f1504161e6d51aacf48bbc75698e67befabd993aa11080940e89b2137a26672a0fa87fe02a9364b99e6b50e5a';
const privateKeyHex = '054d4d4f4275dff6dee9d02a646ecd65c7a30ebecf50a097835ceb61c50958f6';

(async () => {
  const keys = convertKeysToJwkSecp256k1(publicKeyHex, privateKeyHex);
  console.log(keys);
  // const keyObject = await parseJwk({ ...jwk, alg: 'EdDSA' });
  // console.log(keyObject);
})();

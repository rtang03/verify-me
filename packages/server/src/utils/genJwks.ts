import { createPrivateKey } from 'crypto';
import fs from 'fs';
import { fromKeyLike } from 'jose/jwk/from_key_like';

// input: PEM format
// output: JKWS
export const genJwks = (pathToPrivateKey: string) =>
  fromKeyLike(createPrivateKey(fs.readFileSync(pathToPrivateKey))).then((key) => ({
    keys: [key],
  }));

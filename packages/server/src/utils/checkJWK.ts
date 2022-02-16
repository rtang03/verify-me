import { strict as assert } from 'assert';

const isPlainObject = (a) => !!a && a.constructor === Object;
const EC_CURVES = new Set(['P-256', 'secp256k1', 'P-384', 'P-521']);
const OKP_SUBTYPES = new Set(['Ed25519', 'Ed448', 'X25519', 'X448']);

export const checkJWK = (jwk) => {
  try {
    assert(isPlainObject(jwk));
    assert(typeof jwk.kty === 'string' && jwk.kty);

    switch (jwk.kty) {
      case 'EC':
        assert(typeof jwk.crv === 'string' && jwk.crv);
        if (!EC_CURVES.has(jwk.crv)) return undefined;
        assert(typeof jwk.x === 'string' && jwk.x);
        assert(typeof jwk.y === 'string' && jwk.y);
        break;
      case 'OKP':
        assert(typeof jwk.crv === 'string' && jwk.crv);
        if (!OKP_SUBTYPES.has(jwk.crv)) return undefined;
        assert(typeof jwk.x === 'string' && jwk.x);
        break;
      case 'RSA':
        assert(typeof jwk.e === 'string' && jwk.e);
        assert(typeof jwk.n === 'string' && jwk.n);
        break;
      case 'oct':
        break;
      default:
        return undefined;
    }

    assert(jwk.d === undefined && jwk.kty !== 'oct');
    assert(jwk.alg === undefined || (typeof jwk.alg === 'string' && jwk.alg));
    assert(jwk.kid === undefined || (typeof jwk.kid === 'string' && jwk.kid));
    assert(jwk.use === undefined || (typeof jwk.use === 'string' && jwk.use));
    assert(
      jwk.x5c === undefined ||
        (Array.isArray(jwk.x5c) && jwk.x5c.every((x) => typeof x === 'string' && x))
    );
  } catch {
    throw new Error('client JSON Web Key Set is invalid');
  }

  return jwk;
};

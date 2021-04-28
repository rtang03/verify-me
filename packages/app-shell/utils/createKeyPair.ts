import EC from 'elliptic';
import { keccak_256 } from 'js-sha3';
import u8a from 'uint8arrays';
import { createDidDocument } from './createDidDocument';

export const keccak: (data: Uint8Array) => Uint8Array = (data) =>
  new Uint8Array((keccak_256 as any).arrayBuffer(data));

export const toEthereumAddress: (hexPublicKey: string) => string = (hexPublicKey) => {
  const hashInput = u8a.fromString(hexPublicKey.slice(2), 'base16');
  return `0x${u8a.toString(keccak(hashInput).slice(-20), 'base16')}`;
};

export const createKeyPair = () => {
  const secp256k1 = new EC.ec('secp256k1');
  const kp = secp256k1.genKeyPair();
  const publicKey = kp.getPublic('hex');
  const privateKey = kp.getPrivate('hex');
  const address = toEthereumAddress(publicKey);
  const did = addressToDid(address);

  return {
    did,
    address,
    publicKey,
    privateKey,
    didDocument: createDidDocument({ id: address, controllerKey: publicKey }),
  };
};

export const addressToDid = (address: string) => `did:key:${address}`;

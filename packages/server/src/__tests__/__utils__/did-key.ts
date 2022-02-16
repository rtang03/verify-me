// testing did:key
export const holderDIDKey = {
  did: 'did:key:z7r8or8Zd6TdoB3HcJnahm3bJoyYJiCidqvDkNyz1S1CymEeMxeZq2hpTfvYcHPq2TSL73hwmZyhM2bqBViC7DdYAFioB',
  controllerKeyId:
    '0484ac75f5e5842d12c1c0d19d3d389f9be5d6159f1504161e6d51aacf48bbc75698e67befabd993aa11080940e89b2137a26672a0fa87fe02a9364b99e6b50e5a',
  keys: [
    {
      type: 'Secp256k1',
      kid: '0484ac75f5e5842d12c1c0d19d3d389f9be5d6159f1504161e6d51aacf48bbc75698e67befabd993aa11080940e89b2137a26672a0fa87fe02a9364b99e6b50e5a',
      publicKeyHex:
        '0484ac75f5e5842d12c1c0d19d3d389f9be5d6159f1504161e6d51aacf48bbc75698e67befabd993aa11080940e89b2137a26672a0fa87fe02a9364b99e6b50e5a',
      meta: {
        algorithms: [
          'ES256K',
          'ES256K-R',
          'eth_signTransaction',
          'eth_signTypedData',
          'eth_signMessage',
        ],
      },
      kms: 'local',
    },
  ],
  services: [],
  provider: 'did:key',
};

export const holderPublicKeyJwk = {
  kty: 'EC',
  crv: 'secp256k1',
  alg: 'ES256K',
  kid: '0484ac75f5e5842d12c1c0d19d3d389f9be5d6159f1504161e6d51aacf48bbc75698e67befabd993aa11080940e89b2137a26672a0fa87fe02a9364b99e6b50e5a',
  x: 'hKx19eWELRLBwNGdPTifm-XWFZ8VBBYebVGqz0i7x1Y',
  y: 'mOZ776vZk6oRCAlA6JshN6JmcqD6h_4CqTZLmea1Dlo',
};

export const holderPrivateKeyJwk = {
  kty: 'EC',
  crv: 'secp256k1',
  use: 'sig',
  alg: 'ES256K',
  kid: '0484ac75f5e5842d12c1c0d19d3d389f9be5d6159f1504161e6d51aacf48bbc75698e67befabd993aa11080940e89b2137a26672a0fa87fe02a9364b99e6b50e5a',
  x: 'hKx19eWELRLBwNGdPTifm-XWFZ8VBBYebVGqz0i7x1Y',
  y: 'mOZ776vZk6oRCAlA6JshN6JmcqD6h_4CqTZLmea1Dlo',
  d: 'BU1NT0J13_be6dAqZG7NZcejDr7PUKCXg1zrYcUJWPY',
};

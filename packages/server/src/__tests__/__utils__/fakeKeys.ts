export const fakedEd25519Keys = {
  publicKeyHex: 'e4d386e77cd7859b120f51082fb20cf02a446ddad9c47fb4eaf1ab38f05cb82c',
  privateKeyHex:
    '3080c66769bf0b7334f6fae79b0fd1fd96f29490c9c4b4123d339ea2cba57564e4d386e77cd7859b120f51082fb20cf02a446ddad9c47fb4eaf1ab38f05cb82c',
  jwks: {
    keys: [
      {
        kty: 'OKP',
        crv: 'Ed25519',
        alg: 'EdDSA',
        kid: 'e4d386e77cd7859b120f51082fb20cf02a446ddad9c47fb4eaf1ab38f05cb82c',
        x: '5NOG53zXhZsSD1EIL7IM8CpEbdrZxH-06vGrOPBcuCw',
        d: 'MIDGZ2m_C3M09vrnmw_R_ZbylJDJxLQSPTOeosuldWTk04bnfNeFmxIPUQgvsgzwKkRt2tnEf7Tq8as48Fy4LA',
      },
    ],
  },
};

export const fakedES256KKeys = {
  publicKeyHex:
    '04dc2a33aee75e2cd380acac8699afdf7d2ebdda26e2717e232c8675c7b354861f9e4614485db3d44165ed41dca947122d9ef480f6a54e762ee68d3216cbdbfad9',
  privateKeyHex: '8c1c1af24a5e68779b35a0faad772e27f18cb8a8129924f1c7c72583b7ca105d',
  jwks: {
    keys: [
      {
        kty: 'EC',
        crv: 'secp256k1',
        kid: '04dc2a33aee75e2cd380acac8699afdf7d2ebdda26e2717e232c8675c7b354861f9e4614485db3d44165ed41dca947122d9ef480f6a54e762ee68d3216cbdbfad9',
        use: 'sig',
        alg: 'ES256K',
        x: '3CozrudeLNOArKyGma_ffS692ibicX4jLIZ1x7NUhh8',
        y: 'nkYUSF2z1EFl7UHcqUcSLZ70gPalTnYu5o0yFsvb-tk',
        d: 'jBwa8kpeaHebNaD6rXcuJ_GMuKgSmSTxx8clg7fKEF0',
      },
    ],
  },
};

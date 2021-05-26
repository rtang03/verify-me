import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const blake = require('blakejs');

const handler: NextApiHandler = async (req, res) => {
  const method = req.method;
  const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/createVerifiableCredential`;
  const domain = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');

  if (method === 'POST') {
    const { issuer, subject, credentialType, claims } = req.body;

    // Todo: evaluate later, if it should restrict issuer to example.com
    // if (issuer !== `did:web:${domain}`) {
    //   return res.status(Status.OK).send({ status: 'ERROR', message: 'Invalid issuer' });
    // }

    // @see https://veramo.io/docs/api/credential-w3c.icreateverifiablecredentialargs
    const payload = {
      credential: {
        type: ['VerifiableCredential', credentialType],
        issuer: { id: issuer },
        credentialSubject: {
          id: subject,
          ...claims,
        },
      },
      proofFormat: 'jwt',
      save: true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(payload),
    });

    if (response.status === Status.OK || Status.CREATED) {
      const credential = await response.json();
      const hash = blake.blake2bHex(JSON.stringify(credential));
      return res.status(Status.OK).send({ status: 'OK', data: { credential, hash } });
    }
    console.error(`fail to fetch ${url}, status: ${response.status}`);
    res.status(Status.OK).send({ status: 'ERROR', message: OOPS, error: await response.text() });
  }
};

export default handler;

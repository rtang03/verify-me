import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const { id, type, serviceEndpoint } = req.body;
    const did = req.query?.id && `did:web:${req.query?.id}`;
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/didManagerAddService`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify({
        did,
        provider: 'web',
        service: { id, type, serviceEndpoint, description: '' },
      }),
    });

    if (response.status === Status.OK || Status.CREATED) {
      const data = await response.json();
      return res.status(Status.OK).send({ status: 'OK', data });
    }
    console.error(`fail to fetch ${url}, status: ${response.status}`);
    res.status(Status.OK).send({ status: 'ERROR', message: OOPS, error: await response.text() });
  }
};

export default handler;

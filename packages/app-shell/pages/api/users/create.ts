import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  const method = req.method;
  const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/didManagerGetOrCreate`;
  const domain = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');

  if (method === 'POST') {
    const { username } = req.body;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify({ alias: `${domain}:users:${username}` }),
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

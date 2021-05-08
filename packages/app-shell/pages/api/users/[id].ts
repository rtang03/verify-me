import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const domain = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/didManagerFind`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify({ alias: req.query?.id || '' }),
    });
    const status = response.status;

    if (status === Status.OK) {
      const json = await response.json();
      const data = json?.map((item: any) => ({
        ...item,
        keys: item.keys.map((key: any) => ({ ...key, privateKeyHex: '********' })),
      }));
      return res.status(Status.OK).send({ status: 'OK', data });
    } else {
      console.error(`fail to fetch ${url}, status: ${status}`);
      return res.status(Status.OK).send({ status: 'ERROR', message: OOPS, data: [] });
    }
  }
  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

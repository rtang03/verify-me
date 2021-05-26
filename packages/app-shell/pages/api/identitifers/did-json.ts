import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/.well-known/did.json`;
    const response = await fetch(url);
    const status = response.status;

    if (status === Status.OK) {
      const data = await response.json();
      return res.status(Status.OK).send({ status: 'OK', data });
    } else if (status === Status.NOT_FOUND) {
      return res.status(Status.OK).send({ status: 'NOT_FOUND' });
    } else {
      console.error(`fail to fetch ${url}, status: ${status}`);
      return res.status(Status.OK).send({ status: 'ERROR', message: OOPS });
    }
  }
  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

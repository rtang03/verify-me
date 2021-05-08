import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const domain = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/issuers/did:web:${domain}/credentials`;
    const response = await fetch(url, { headers: { authorization: `Bearer jklj;kljkl` } });
    const status = response.status;

    if (status === Status.OK) {
      const result = await response.json();
      return res.status(Status.OK).send({ status: 'OK', data: result?.data });
    } else {
      console.error(`fail to fetch ${url}, status: ${status}`);
      return res.status(Status.OK).send({ status: 'ERROR', message: OOPS });
    }
  }
  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

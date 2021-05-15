import type { DataStoreORMGetMessagesArgs } from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/dataStoreORMGetMessages`;
    const args: DataStoreORMGetMessagesArgs = {
      where: [{ column: 'id', op: 'Equal', value: [req.query.id as string] }],
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(args),
    });
    const status = response.status;

    if (status === Status.OK) {
      const data = await response.json();
      return res.status(Status.OK).send({ status: 'OK', data });
    } else {
      console.error(`fail to fetch ${url}, status: ${status}`);
      return res.status(Status.OK).send({ status: 'ERROR', message: OOPS });
    }
  }
  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

import type { CreateTenantArgs } from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    // const url = `${process.env.NEXT_PUBLIC_BACKEND}/tenants?user_id=${}`;
    // const response = await fetch(url);

    res.status(Status.OK).send({ data: 'OK' });
  }
};

export default handler;

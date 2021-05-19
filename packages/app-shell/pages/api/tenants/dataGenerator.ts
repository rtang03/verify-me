import type { CommonResponse, Paginated } from '@verify/server';
import { Tenant } from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const session = (await getSession({ req })) as any;
    const user_id = session?.user?.id;

    if (user_id) {
      const url = `${process.env.NEXT_PUBLIC_BACKEND}/tenants?user_id=${user_id}`;
      const response = await fetch(url, { headers: { authorization: `Bearer jklj;kljkl` } });
      const status = response.status;
      if (status === Status.OK) {
        const data = await response.json();
        const result: CommonResponse<Paginated<Tenant>> = { status: 'OK', data };

        return res.status(Status.OK).send(result);
      } else {
        console.error(`fail to fetch ${url}, status: ${status}`);
        return res.status(Status.OK).send({ status: 'ERROR', message: OOPS });
      }
    }
    res.status(Status.OK).send({ data: 'protected' });
  }
};

export default handler;

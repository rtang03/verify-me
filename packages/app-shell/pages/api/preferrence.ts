import { Users } from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';
import { OOPS } from '../../utils';

const handler: NextApiHandler = async (req, res) => {
  const session: any = await getSession({ req });

  if (!session) return res.status(Status.OK).send({ data: 'protected' });

  const user: Users = session?.user;
  const url = `${process.env.NEXT_PUBLIC_BACKEND}/users/${user.id}`;

  try {
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: { authorization: `Bearer jklj;kljkl` },
      });

      if (response.status === Status.OK) {
        const json = await response.json();
        const user: Users = json.data.items[0];
        const data = {
          user_id: user.id,
          active_tenant: user.active_tenant,
        };
        return res.status(Status.OK).send({ status: 'OK', data });
      } else
        return res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: await response.text() });
    } else if (req.method === 'PUT') {
      const body = req.body;
      const response = await fetch(url, {
        headers: { authorization: `Bearer jklj;kljkl` },
        body: JSON.stringify(body),
      });

      if (response.status === Status.OK) {
        return res.status(Status.OK).send({ status: 'OK', data: true });
      } else
        return res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: await response.text() });
    }
  } catch (error) {
    console.error(error);
    return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
  }
  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

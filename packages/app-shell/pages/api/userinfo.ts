import { Accounts, Users } from '@verify/server';
import Status from 'http-status';
import pick from 'lodash/pick';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';
import type { UserInfo } from '../../types';
import { OOPS } from '../../utils';

// This is Accounts Entity of Next-Auth
// TODO: revisit if this is correct implementation, when multiple OAuth provider are added next-auth login
const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const session: any = await getSession({ req });
    let accounts: Accounts[] | undefined;

    if (!session) return res.status(Status.OK).send({ data: 'protected' });

    const user: Users = session?.user;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/accounts?user_id=${user.id}&skip=0&take=50`,
        { headers: { authorization: `Bearer jklj;kljkl` } }
      );

      if (response.status === Status.OK) {
        const json = await response.json();
        accounts = json.data.items;
      } else
        return res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: await response.text() });
    } catch (error) {
      console.error(error);
    }

    const userInfo: UserInfo = {
      ...user,
      accounts: accounts?.map((account) =>
        pick(account, 'id', 'provider_id', 'provider_account_id', 'compound_id')
      ),
    };
    return res.status(Status.OK).send({ status: 'OK', data: userInfo });
  }
  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

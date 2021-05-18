import { Accounts, Tenant, Users } from '@verify/server';
import { Router } from 'express';
import Status from 'http-status';
import pick from 'lodash/pick';
import { getSession } from 'next-auth/client';
import type { Repository } from 'typeorm';
import type { UserInfo } from '../../types';

export const userRoute = (
  userRepo: Repository<Users>,
  accountRepo: Repository<Accounts>,
  tenantRepo: Repository<Tenant>
) => {
  const router = Router();

  router.get('/userinfo', async (req, res) => {
    const session = await getSession({ req });
    let userInfo: UserInfo;
    let users: Users | undefined;
    let accounts: Accounts[] | undefined;
    let tenants: Tenant[] | undefined;

    if (!session) return res.status(Status.OK).send({ data: 'protected' });

    try {
      users = await userRepo.findOne({ where: { email: session?.user?.email } });
    } catch (error) {
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }

    if (users?.id) {
      const { id, email, name, image } = users;

      try {
        tenants = await tenantRepo.find({ where: { user_id: id } });
      } catch (error) {
        console.error('unexpected error');
        console.error(error);
      }

      try {
        accounts = await accountRepo.find({ where: { user_id: id } });
      } catch (error) {
        console.error('unexpected error');
        console.error(error);
      }
      userInfo = { id, email, name, image };

      accounts &&
        (userInfo.accounts = accounts.map((account) =>
          pick(account, 'id', 'provider_id', 'provider_account_id', 'compound_id')
        ));

      tenants && (userInfo.tenants = tenants);

      return res.status(Status.OK).send({ status: 'OK', data: userInfo });
    }
    res.status(Status.NOT_FOUND).send({ status: 'ERROR', error: 'record not found' });
  });

  return router;
};

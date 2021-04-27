import { Router } from 'express';
import Status from 'http-status';
import pick from 'lodash/pick';
import { getSession } from 'next-auth/client';
import { Repository } from 'typeorm';
import { User, Account } from '../../models';
import type { UserInfo } from '../../types';

export const userRoute = (userRepo: Repository<User>, accountRepo: Repository<Account>) => {
  const router = Router();

  router.get('/userinfo', async (req, res) => {
    const session = await getSession({ req });
    let userInfo: UserInfo;

    if (!session) return res.status(Status.OK).send({ content: 'protected' });

    const user = await userRepo.findOne({ where: { email: session?.user?.email } });
    if (user?.id) {
      const { id, email, name, image } = user;
      const accounts = await accountRepo.find({ where: { user_id: id } });
      if (accounts) {
        userInfo = {
          id,
          email,
          name,
          image,
          accounts: accounts.map((account) =>
            pick(account, 'id', 'provider_id', 'provider_account_id', 'compound_id')
          ),
        };
        return res.status(Status.OK).send({ content: userInfo });
      }
    }
    res.status(Status.NOT_FOUND).send({ error: 'record not found' });
  });

  return router;
};

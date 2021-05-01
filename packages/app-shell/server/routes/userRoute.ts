import { Accounts, Users } from '@verify/server';
import { Router } from 'express';
import Status from 'http-status';
import pick from 'lodash/pick';
import { getSession } from 'next-auth/client';
import { Repository } from 'typeorm';
import type { UserInfo } from '../../types';

export const userRoute = (userRepo: Repository<Users>, accountRepo: Repository<Accounts>) => {
  const router = Router();

  router.get('/userinfo', async (req, res) => {
    const session = await getSession({ req });
    let userInfo: UserInfo;

    if (!session) return res.status(Status.OK).send({ content: 'protected' });

    const user = await userRepo.findOne({ where: { email: session?.user?.email } });
    if (user?._id) {
      const { _id, email, name, image } = user;
      const accounts = await accountRepo.find({ where: { userId: _id } });
      if (accounts) {
        userInfo = {
          _id,
          email,
          name,
          image,
          accounts: accounts.map((account) =>
            pick(account, '_id', 'providerId', 'providerAccountId', 'compoundId')
          ),
        };
        return res.status(Status.OK).send({ content: userInfo });
      }
    }
    res.status(Status.NOT_FOUND).send({ error: 'record not found' });
  });

  return router;
};

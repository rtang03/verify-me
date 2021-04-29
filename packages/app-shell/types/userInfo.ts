import { Accounts, Users } from '@verify/server';

export type UserInfo = Pick<Users, 'name' | 'email' | 'image' | '_id'> & {
  accounts: Pick<Accounts, '_id' | 'providerId' | 'providerAccountId' | 'compoundId'>[];
};

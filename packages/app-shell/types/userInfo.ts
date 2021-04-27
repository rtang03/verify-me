import { Account, User } from '../models';

export type UserInfo = Pick<User, 'name' | 'email' | 'image' | 'id'> & {
  accounts: Pick<Account, 'id' | 'provider_id' | 'provider_account_id' | 'compound_id'>[];
};

import { Accounts, Users } from '@verify/server';

export type UserInfo = Pick<Users, 'name' | 'email' | 'image' | 'id'> & {
  accounts?: Pick<Accounts, 'id' | 'provider_id' | 'provider_account_id' | 'compound_id'>[];
  tenants?: any;
};

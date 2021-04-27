import { createHash } from 'crypto';
import { EntitySchema } from 'typeorm';

// Note: Not like User, this is not custom model for Next-Auth
// This is plain old class for TypeORM, and therefore,
// they are snake case.
export class Account {
  compound_id?: string;
  id?: number;
  constructor(
    public user_id: number,
    public provider_id: string,
    public provider_type: string,
    public provider_account_id: string,
    public refresh_token: string,
    public access_token: string,
    public access_token_expires: Date | undefined
  ) {
    // The compound ID ensures there is only one entry for a given provider and account
    this.compound_id = createHash('sha256')
      .update(`${provider_id}:${provider_account_id}`)
      .digest('hex');
    this.user_id = user_id;
    this.provider_type = provider_type;
    this.provider_id = provider_id;
    this.provider_account_id = provider_account_id;
    this.refresh_token = refresh_token;
    this.access_token = access_token;
    this.access_token_expires = access_token_expires;
  }
}

// Postgres
export const AccountSchemaPsql = {
  name: 'Account',
  target: Account,
  tableName: 'accounts',
  columns: {
    id: {
      primary: true,
      type: 'int' as any,
      generated: true as any,
    },
    compound_id: {
      // The compound ID ensures that there there is only one instance of an
      // OAuth account in a way that works across different databases.
      // It is not used for anything else.
      type: 'varchar' as any,
      unique: true,
    },
    user_id: { type: 'int' as any },
    provider_type: { type: 'varchar' as any },
    provider_id: { type: 'varchar' as any },
    provider_account_id: { type: 'varchar' as any },
    refresh_token: { type: 'text' as any, nullable: true },
    access_token: { type: 'text' as any, nullable: true },
    access_token_expires: { type: 'timestamp' as any, nullable: true },
    created_at: { type: 'timestamp' as any, createDate: true },
    updated_at: { type: 'timestamp' as any, updateDate: true },
  },
  indices: [
    {
      name: 'user_id',
      columns: ['user_id'],
    },
    {
      name: 'provider_i',
      columns: ['provider_id'],
    },
    {
      name: 'provider_account_id',
      columns: ['provider_account_id'],
    },
  ],
};

export const TypoOrmAccountSchema = new EntitySchema(AccountSchemaPsql);

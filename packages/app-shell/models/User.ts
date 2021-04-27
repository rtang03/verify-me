import Adapters from 'next-auth/adapters';
import { EntitySchema } from 'typeorm';

// @see https://next-auth.js.org/tutorials/typeorm-custom-models
export class User {
  id?: number;

  // phoneNum is custom fiield, used by NextAuth.
  phone_num?: string;
  constructor(
    public name: string,
    public email: string,
    public image: string,
    public emailVerified: Date | undefined
  ) {
    if (emailVerified) this.emailVerified = new Date();
  }
}

// Generic
export const UserSchema = {
  name: 'User',
  tableName: 'users',
  target: User,
  columns: {
    ...Adapters.TypeORM.Models.User.schema.columns,
    phone_num: {
      type: 'varchar' as any,
      nullable: true,
    },
  },
};

// In Psql all columns, requires snake-case
export const UserSchemaPsql = {
  name: 'User',
  tableName: 'users',
  target: User,
  columns: {
    id: {
      primary: true,
      type: 'int' as any,
      generated: true as any,
    },
    name: {
      type: 'varchar' as any,
      nullable: true,
    },
    email: {
      type: 'varchar' as any,
      unique: true,
      nullable: true,
    },
    email_verified: {
      type: 'timestamp' as any,
      nullable: true,
    },
    image: {
      type: 'varchar' as any,
      nullable: true,
    },
    created_at: {
      type: 'timestamp' as any,
      createDate: true,
    },
    updated_at: {
      type: 'timestamp' as any,
      updateDate: true,
    },
    phone_num: {
      type: 'varchar' as any,
      nullable: true,
    },
  },
};

// @see https://typeorm.io/#/usage-with-javascript
// Cannot use class decorator directly
// Need to treat the TypeOrm entity, by creating EntitySchema
export const TypeOrmUserSchema = new EntitySchema(UserSchemaPsql);

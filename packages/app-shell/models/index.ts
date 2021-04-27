import { User, UserSchema } from './User';

export * from './User';
export * from './Account';

export const models = {
  User: { model: User, schema: UserSchema },
};

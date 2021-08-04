import adapter, { TypeORMUserModel } from '@next-auth/typeorm-legacy-adapter';

/**
 * This must be in line with @verify/server/src/entities/Users.ts
 */
// see https://next-auth.js.org/tutorials/typeorm-custom-models
// see https://github.com/nextauthjs/adapters/blob/main/packages/typeorm-legacy/docs/tutorials/typeorm-custom-models.md
export class User implements TypeORMUserModel {
  constructor(
    public name: string,
    public email: string,
    public image: string,
    public emailVerified: Date | undefined,
    public active_tenant: string
  ) {
    this.emailVerified = emailVerified && new Date();
  }
  [x: string]: unknown;
}

// source: @next-auth/typeorm-legacy-adapter/dist/models/user.js
export const CustomUserSchema = {
  name: 'User',
  target: User,
  columns: {
    id: { primary: true, type: 'int' as any, generated: true as any },
    name: { type: 'varchar' as any, nullable: true },
    email: { type: 'varchar' as any, unique: true, nullable: true },
    email_verified: { type: 'timestamp' as any, nullable: true },
    image: { type: 'varchar' as any, nullable: true },
    createdAt: { type: 'timestamp' as any, createDate: true },
    updatedAt: { type: 'timestamp' as any, updateDate: true },
    active_tenant: { type: 'varchar' as any, nullable: true },
  },
};

const typeORMUserModel = {
  model: User as unknown as TypeORMUserModel,
  schema: CustomUserSchema,
};

export default typeORMUserModel;

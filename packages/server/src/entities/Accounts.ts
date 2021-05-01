import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Accounts {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  compoundId: string;

  @Column()
  userId: string;

  @Column()
  providerType: string;

  @Column()
  providerId: string;

  @Column()
  providerAccountId: string;

  @Column()
  refreshToken: string;

  @Column()
  accessToken: string;

  @Column()
  accessTokenExpires: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;
}

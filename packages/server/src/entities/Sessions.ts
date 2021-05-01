import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Sessions {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  userId: string;

  @Column()
  expires: string;

  @Column()
  sessionToken: string;

  @Column()
  accessToken: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;
}

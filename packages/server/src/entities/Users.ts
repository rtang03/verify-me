import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Users {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  image: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;
}

import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

export class QueryByExample {
  @Column()
  type: string;

  @Column()
  credentialQuery: string;
}

export class DIDAuth {
  @Column()
  type: string;
}

@Entity()
export class Presentations {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  domain: string;

  @Column()
  name: string;

  @Column()
  query: (QueryByExample | DIDAuth)[];
}

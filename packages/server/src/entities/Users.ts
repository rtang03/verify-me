import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'timestamp with time zone' })
  email_verified: string;

  @Column()
  image: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updated_at: string;
}

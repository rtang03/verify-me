import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Accounts {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  compound_id: string;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  provider_type: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  provider_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  provider_account_id: string;

  @Column()
  refresh_token: string;

  @Column()
  access_token: string;

  @Column({ type: 'timestamp with time zone' })
  access_token_expires: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updated_at: string;
}

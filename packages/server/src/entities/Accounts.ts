import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Accounts {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('compound_id', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  compound_id: string;

  @Index('user_id')
  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  provider_type: string;

  @Index('provider_id')
  @Column({ type: 'varchar', length: 255, nullable: false })
  provider_id: string;

  @Index('provider_account_id')
  @Column({ type: 'varchar', length: 255, nullable: false })
  provider_account_id: string;

  @Column({ type: 'text', nullable: true })
  refresh_token: string;

  @Column({ type: 'text', nullable: true })
  access_token: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  access_token_expires: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  updated_at: string;
}

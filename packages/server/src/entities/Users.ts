import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Index('email', { unique: true })
  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'timestamp', nullable: true })
  email_verified: Date;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'timestamp', nullable: false, default: 'Now()' })
  created_at: string;

  @Column({ type: 'timestamp', nullable: false, default: 'Now()' })
  updated_at: string;

  @Column({ type: 'varchar', nullable: true })
  active_tenant: string;
}

import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Index('email', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  email_verified: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  updated_at: string;
}

import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expires: string;

  @Index('session_token', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  session_token: string;

  @Index('access_token', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  access_token: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  updated_at: string;
}

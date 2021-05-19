import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('slug', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'simple-array', nullable: true })
  members: string[];

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  db_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  db_host: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  db_username: string;

  @Column({ type: 'text', nullable: true })
  db_password: string;

  @Column({ type: 'int', nullable: false, default: 5432 })
  db_port: number;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false, default: 'Now()' })
  updated_at: string;
}

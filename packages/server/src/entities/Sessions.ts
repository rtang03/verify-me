import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Sessions {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expires: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  session_token: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  access_token: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  created_at: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updated_at: string;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OidcPayload {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  type: number;

  @Column({ type: 'text' })
  payload: string;

  @Column({ type: 'varchar', length: 255 })
  grantId: string;

  @Column({ type: 'varchar', length: 255 })
  userCode: string;

  @Column({ type: 'varchar', length: 255 })
  uid: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp' })
  consumedAt: Date;
}

import type { AdapterPayload } from 'oidc-provider';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('oidc_payload')
export class OidcPayload implements AdapterPayload {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'integer', nullable: true })
  type?: number;

  @Column({ type: 'text', nullable: true })
  payload?: string;

  @Column({ type: 'varchar', nullable: true })
  grantId?: string;

  @Column({ type: 'varchar', nullable: true })
  userCode?: string;

  @Index('oidc_payload_uid', { unique: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  uid?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  consumedAt?: Date;

  [key: string]: unknown;
}

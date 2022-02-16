import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * https://learn.mattr.global/api-reference/v1.0.1#operation/createPresRequest
 */
@Entity('presentation_request')
export class PresentationRequest {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', nullable: false })
  challenge: string;

  // Verifiier's client's Did
  @Column({ type: 'varchar', nullable: false })
  did: string;

  @Column({ type: 'varchar', nullable: false })
  templateId: string;

  @Column({ type: 'timestamp', nullable: false })
  expiresTime: Date;

  @Column({ type: 'varchar', nullable: false })
  callbackUrl: string;
}

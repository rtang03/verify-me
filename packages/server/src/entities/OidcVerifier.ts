import { Column, Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { PresentationRequestTemplate } from './PresentationRequestTemplate';

@Entity('oidc_verifier')
export class OidcVerifier {
  @PrimaryColumn()
  id: string;

  @ManyToOne(
    () => PresentationRequestTemplate,
    (presentationRequestTemplate) => presentationRequestTemplate.usedByVerifiers,
    { eager: true, cascade: ['insert'], onDelete: 'CASCADE', nullable: false }
  )
  presentationTemplate: PresentationRequestTemplate;

  @Column({ type: 'simple-json', nullable: false })
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;

  // Note: intentionally, not picking OneToOne JoinColumn, because the corresponding did is created
  // using veramo agent method, instead of direct psql-insert
  @Column({ type: 'varchar', nullable: true })
  did: string;
}

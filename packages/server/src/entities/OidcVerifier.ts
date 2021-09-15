import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OidcVerifier {
  @PrimaryColumn()
  id: string;

  // TODO: Not knowing if I need this field. Double check it later
  @Column({ nullable: true })
  presentationTemplateId: string;

  @Column({ type: 'simple-json', nullable: false })
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;

  // Note: intentionally, not picking OneToOne JoinColumn, because the corresponding did is created
  // using veramo agent method, instead of direct psql-insert
  @Column({ nullable: true })
  did: string;
}

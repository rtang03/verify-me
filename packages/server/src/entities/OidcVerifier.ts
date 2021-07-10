import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OidcVerifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  verifierDid: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  presentationTemplateId: string;

  @Column({ type: 'simple-json', nullable: false })
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;
}

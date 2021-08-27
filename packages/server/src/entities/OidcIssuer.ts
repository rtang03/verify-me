import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OidcCredential } from './OidcCredential';
import { OidcFederatedProvider } from './OidcFederatedProvider';

@Entity()
export class OidcIssuer {
  // @PrimaryGeneratedColumn('uuid')
  // id: string;

  @PrimaryColumn()
  id: string;

  @OneToOne(() => OidcFederatedProvider, { cascade: true })
  @JoinColumn()
  federatedProvider: OidcFederatedProvider;

  @OneToOne(() => OidcCredential, { cascade: true })
  @JoinColumn()
  credential: OidcCredential;

  @Column({ type: 'simple-json', nullable: false })
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;

  // Veramo IIdentifier
  @Column({ nullable: true })
  identifierDid: string;
}

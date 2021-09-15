import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OidcCredential } from './OidcCredential';
import { OidcFederatedProvider } from './OidcFederatedProvider';

@Entity()
export class OidcIssuer {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => OidcFederatedProvider, { cascade: true })
  @JoinColumn()
  federatedProvider: OidcFederatedProvider;

  // TODO: need refactoring, OidcCredential defines type of Credential offered by this issuers
  // maybe, the "issuerDid" of OidcCredential should be equal to "did".
  // Currently, this field is NOT related to id_token issuance
  @OneToOne(() => OidcCredential, { cascade: true })
  @JoinColumn()
  credential: OidcCredential;

  /**
   * List of supported claims, in addition of standard openid "profile"
   */
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

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OidcCredential } from './OidcCredential';
import { OidcFederatedProvider } from './OidcFederatedProvider';

@Entity('oidc_issuer')
export class OidcIssuer {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => OidcFederatedProvider, { eager: true, cascade: true, nullable: false })
  @JoinColumn()
  federatedProvider: OidcFederatedProvider;

  // TODO: need refactoring, OidcCredential defines type of Credential offered by this issuers
  // maybe, the "issuerDid" of OidcCredential should be equal to "did".
  // Currently, this field is NOT related to id_token issuance
  @OneToOne(() => OidcCredential, { eager: true, cascade: true, nullable: true })
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
  @Column({ type: 'varchar', nullable: true })
  did: string;
}

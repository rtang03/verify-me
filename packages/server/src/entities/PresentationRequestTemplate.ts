import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OidcVerifier } from './OidcVerifier';

type CredentialQuery = {
  claimType: string;
  claimValue?: string;
  reason?: string;
  essential: boolean;
  credentialType?: string;
  credentialContext?: string;
  issuers: { did: string; url: string }[];
};

type Query = {
  type: string;
  credentialQuery: CredentialQuery[];
};

@Entity('presentation_req_template')
export class PresentationRequestTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  domain: string;

  @Column({ type: 'simple-json', nullable: false })
  query: Query[];

  @OneToMany(() => OidcVerifier, (oidcVerifier) => oidcVerifier.presentationTemplate)
  usedByVerifiers: OidcVerifier[];
}

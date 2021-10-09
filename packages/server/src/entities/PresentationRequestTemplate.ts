import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OidcVerifier } from './OidcVerifier';

type Claim = {
  claimType: 'DIDAuth' | 'Custom';
  reason?: string;
  essential: boolean;
  credentialType?: string;
  credentialContext?: string;
  issuers: { did: string; url: string }[];
};

@Entity('presentation_req_template')
export class PresentationRequestTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  alias: string;

  @Column({ type: 'simple-json', nullable: false })
  claims: Claim[];

  @OneToMany(() => OidcVerifier, (oidcVerifier) => oidcVerifier.presentationTemplate)
  usedByVerifiers: OidcVerifier[];
}

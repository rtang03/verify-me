import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oidc_federated_provider')
export class OidcFederatedProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  callbackUrl: string;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'simple-array', nullable: false })
  scope: string[];

  @Column({ type: 'varchar', nullable: false })
  clientId: string;

  @Column({ type: 'varchar', nullable: false })
  clientSecret: string;
}

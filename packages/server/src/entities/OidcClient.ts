import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OidcClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  issuerId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  secret: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'simple-array', nullable: false })
  redirectUris: string[];

  @Column({ type: 'simple-array', nullable: false })
  responseTypes: string[];

  @Column({ type: 'simple-array', nullable: false })
  grantTypes: string[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  tokenEndpointAuthMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  idTokenSignedResponseAlg: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  applicationType: string;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OidcFederatedProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  callbackUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  url: string;

  @Column({ type: 'simple-array', nullable: false })
  scope: string[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  clientId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  clientSecret: string;
}

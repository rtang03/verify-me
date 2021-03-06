import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OidcCredential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  issuerDid: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: false })
  context: string[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  type: string;
}

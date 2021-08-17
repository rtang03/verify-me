import type { ClientAuthMethod, ResponseType, SigningAlgorithmWithNone } from 'oidc-provider';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// https://openid.net/specs/openid-connect-registration-1_0.html
@Entity()
export class OidcClient {
  @PrimaryGeneratedColumn('uuid')
  client_id: string;

  // TODO: verifiy the use of this field
  @Column({ type: 'varchar', length: 255, nullable: false })
  issuerId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  client_secret: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_name: string;

  @Column({ type: 'simple-array', nullable: false })
  redirect_uris: string[];

  @Column({ type: 'simple-array', nullable: false })
  response_types: ResponseType[];

  @Column({ type: 'simple-array', nullable: false })
  grant_types: string[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  token_endpoint_auth_method: ClientAuthMethod;

  @Column({ type: 'varchar', length: 255, nullable: false })
  id_token_signed_response_alg: SigningAlgorithmWithNone;

  @Column({ type: 'varchar', length: 255, nullable: false })
  application_type: 'web' | 'native';

  [key: string]: unknown;
}

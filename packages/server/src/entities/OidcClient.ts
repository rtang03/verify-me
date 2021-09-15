import type {
  CIBADeliveryMode,
  ClientAuthMethod,
  ResponseType,
  SigningAlgorithmWithNone,
} from 'oidc-provider';
import { Column, Entity, PrimaryColumn } from 'typeorm';

// https://openid.net/specs/openid-connect-registration-1_0.html
@Entity()
export class OidcClient {
  @PrimaryColumn()
  client_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verifierId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  client_secret: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_name: string;

  @Column({ type: 'simple-array', nullable: true })
  redirect_uris?: string[];

  @Column({ type: 'simple-array', nullable: true })
  response_types: ResponseType[];

  @Column({ type: 'simple-array', nullable: false })
  grant_types: string[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  token_endpoint_auth_method: ClientAuthMethod;

  @Column({ type: 'varchar', length: 255, nullable: false })
  id_token_signed_response_alg: SigningAlgorithmWithNone;

  @Column({ type: 'varchar', length: 255, nullable: false })
  application_type: 'web' | 'native';

  @Column({ nullable: true })
  did: string;

  // @Column({ nullable: true })
  // jwks_uri?: string;

  // poll | ping
  @Column({ nullable: true })
  backchannel_token_delivery_mode?: CIBADeliveryMode;

  @Column({ nullable: true })
  backchannel_client_notification_endpoint?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  backchannel_authentication_request_signing_alg?: SigningAlgorithmWithNone;

  [key: string]: unknown;
}

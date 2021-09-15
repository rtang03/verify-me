import type { Request } from 'express';
import { OidcIssuer } from '../entities';
import { Provider } from 'oidc-provider';

export interface RequestWithVhost extends Request {
  vhost?: any;
  tenantId?: string;
  issuerId?: string;
  verifierId?: string;
  issuer?: OidcIssuer;
  openIdConfig?: any;
  oidcProvider?: Provider;
}

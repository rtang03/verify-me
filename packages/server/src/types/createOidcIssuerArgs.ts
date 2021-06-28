import * as yup from 'yup';
import { OidcCredential, OidcFederatedProvider } from '../entities';

export type CreateOidcIssuerArgs = {
  credential: OidcCredential;
  federatedProvider: OidcFederatedProvider;
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;
};

export const createOidcIssuerArgsSchema = yup.object().shape({
  issuerDid: yup.string(),
  name: yup.string().required(),
  description: yup.string(),
  type: yup.string().required(),
});

export type CreateOidcIssuerClientArgs = {
  name: string;
  redirectUris: string[];
  responseTypes?: string[];
  grantTypes?: string[];
  tokenEndpointAuthMethod?: string;
  idTokenSignedResponseAlg?: string;
  applicationType?: string;
};

export type CreateOidcVerifierArgs = {
  id?: string;
  presentationTemplateName: string;
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;
  did?: string;
};

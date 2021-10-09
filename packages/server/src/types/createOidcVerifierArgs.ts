export type CreateOidcVerifierArgs = {
  id?: string;
  presentationTemplateAlias: string;
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;
  did?: string;
};

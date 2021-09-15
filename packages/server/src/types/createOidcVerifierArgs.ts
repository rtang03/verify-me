export type CreateOidcVerifierArgs = {
  id?: string;
  presentationTemplateId?: string;
  claimMappings: Array<{
    jsonLdTerm: string;
    oidcClaim: string;
  }>;
  did?: string;
};

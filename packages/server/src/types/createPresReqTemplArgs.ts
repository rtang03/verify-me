export type CreatePresReqTemplArgs = {
  query: {
    type: string;
    credentialQuery: {
      claimType: string;
      claimValue?: string;
      reason?: string;
      essential: boolean;
      credentialType?: string;
      credentialContext?: string;
      issuers: { did: string; url: string }[];
    }[];
  }[];
  domain: string;
  name: string;
};

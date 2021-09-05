/**
 * list of clam under Oidc default "Profile" scope. Not required for now.
 */
export const OIDC_PROFILE_CLAIM_MAPPINGS = [
  {
    jsonLdTerm: 'address',
    oidcClaim: 'address',
  },
  {
    jsonLdTerm: 'email',
    oidcClaim: 'email',
  },
  {
    jsonLdTerm: 'emailVerified',
    oidcClaim: 'email_verified',
  },
  {
    jsonLdTerm: 'phoneNumber',
    oidcClaim: 'phone_number',
  },
  {
    jsonLdTerm: 'phoneNumberVerified',
    oidcClaim: 'phone_number_verified',
  },
  {
    jsonLdTerm: 'birthdate',
    oidcClaim: 'birthdate',
  },
  {
    jsonLdTerm: 'familyName',
    oidcClaim: 'family_name',
  },
  {
    jsonLdTerm: 'gender',
    oidcClaim: 'gender',
  },
  {
    jsonLdTerm: 'givenName',
    oidcClaim: 'given_name',
  },
  {
    jsonLdTerm: 'locale',
    oidcClaim: 'locale',
  },
  {
    jsonLdTerm: 'middleName',
    oidcClaim: 'middle_name',
  },
  {
    jsonLdTerm: 'name',
    oidcClaim: 'name',
  },
  {
    jsonLdTerm: 'nickname',
    oidcClaim: 'nickname',
  },
  {
    jsonLdTerm: 'picture',
    oidcClaim: 'picture',
  },
  {
    jsonLdTerm: 'preferredUsername',
    oidcClaim: 'preferred_username',
  },
  {
    jsonLdTerm: 'profile',
    oidcClaim: 'profile',
  },
  {
    jsonLdTerm: 'updatedAt',
    oidcClaim: 'updated_at',
  },
  {
    jsonLdTerm: 'website',
    oidcClaim: 'website',
  },
  {
    jsonLdTerm: 'zoneinfo',
    oidcClaim: 'zoneinfo',
  },
];

const CUSTOM_CLAIMS = {
  openid_configuration_url: {
    jsonLdTerm: 'openidConfigurationUrl',
    oidcClaim: 'openid_configuration_url',
  },
};

export type ClaimMapping = { jsonLdTerm: string; oidcClaim: string };

export const getClaimMappings: (mappings: ClaimMapping[]) => {
  supportedClaims: string[];
  mappings: ClaimMapping[];
} = (mappings) => {
  const mappingsObject = mappings.reduce((prev, curr) => ({ ...prev, [curr.oidcClaim]: curr }), {});

  // Note: the default "profile" claim can be override.
  const combined = { ...CUSTOM_CLAIMS, ...mappingsObject };

  return {
    supportedClaims: Object.keys(combined),
    mappings: Object.values(combined),
  };
};

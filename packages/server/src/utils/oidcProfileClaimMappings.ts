/**
 * list of clam under Oidc default "Profile" scope. Not required for now.
 */
export const OIDC_PROFILE_CLAIM_MAPPINGS = {
  address: {
    jsonLdTerm: 'address',
    oidcClaim: 'address',
  },
  email: {
    jsonLdTerm: 'email',
    oidcClaim: 'email',
  },
  email_verified: {
    jsonLdTerm: 'emailVerified',
    oidcClaim: 'email_verified',
  },
  phone_number: {
    jsonLdTerm: 'phoneNumber',
    oidcClaim: 'phone_number',
  },
  phone_number_verified: {
    jsonLdTerm: 'phoneNumberVerified',
    oidcClaim: 'phone_number_verified',
  },
  birthdate: {
    jsonLdTerm: 'birthdate',
    oidcClaim: 'birthdate',
  },
  family_name: {
    jsonLdTerm: 'familyName',
    oidcClaim: 'family_name',
  },
  gender: {
    jsonLdTerm: 'gender',
    oidcClaim: 'gender',
  },
  given_name: {
    jsonLdTerm: 'givenName',
    oidcClaim: 'given_name',
  },
  locale: {
    jsonLdTerm: 'locale',
    oidcClaim: 'locale',
  },
  middle_name: {
    jsonLdTerm: 'middleName',
    oidcClaim: 'middle_name',
  },
  name: {
    jsonLdTerm: 'name',
    oidcClaim: 'name',
  },
  nickname: {
    jsonLdTerm: 'nickname',
    oidcClaim: 'nickname',
  },
  picture: {
    jsonLdTerm: 'picture',
    oidcClaim: 'picture',
  },
  preferred_username: {
    jsonLdTerm: 'preferredUsername',
    oidcClaim: 'preferred_username',
  },
  profile: {
    jsonLdTerm: 'profile',
    oidcClaim: 'profile',
  },
  updated_at: {
    jsonLdTerm: 'updatedAt',
    oidcClaim: 'updated_at',
  },
  website: {
    jsonLdTerm: 'website',
    oidcClaim: 'website',
  },
  zoneinfo: {
    jsonLdTerm: 'zoneinfo',
    oidcClaim: 'zoneinfo',
  },
};

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

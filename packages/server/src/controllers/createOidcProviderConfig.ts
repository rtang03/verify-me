import type { Configuration } from 'oidc-provider';
import { OidcPsqlAdapter } from '../utils/oidcPsqlAdapter';

export const createOidcProviderConfig = () => {
  return <Configuration>{
    adapter: OidcPsqlAdapter,
    // clients: [
    // {
    //   client_id: 'foo',
    //   redirect_uris: ['https://jwt.io'], // using jwt.io as redirect_uri to show the ID Token contents
    //   response_types: ['id_token' as ResponseType],
    //   grant_types: ['implicit'],
    //   token_endpoint_auth_method: 'none' as ClientAuthMethod,
    // },
    // ],
    interactions: {
      url: (ctx, interaction) => {
        // See example
        // Interaction {
        //   iat: 1624974703,
        //   exp: 1624975703,
        //   returnTo:
        //     'https://issuer.example.com/oidc/issuers/bb41301f-0fc6-406d-ac34-3afeb003769e/auth/SbjO7-Sb7l2qgYUywXUgB',
        //   prompt: { name: 'login', reasons: ['no_session'], details: {} },
        //   params: {
        //     client_id: 'foo',
        //     nonce: 'foobar',
        //     redirect_uri: 'https://jwt.io',
        //     response_type: 'id_token',
        //     scope: 'openid',
        //   },
        //   kind: 'Interaction',
        //   jti: 'SbjO7-Sb7l2qgYUywXUgB',
        // };
        return `/oidc/issuers/interaction/${interaction.uid}`;
      },
    },
    cookies: {
      keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
    },
    findAccount: async (ctx, id) => {
      // Todo: get claim from here
      return {
        accountId: id,
        claims: async () => {
          return { sub: id, email: 'tangross@hotmail.com' };
        },
      };
    },
    claims: {
      address: ['address'],
      email: ['email', 'email_verified'],
      phone: ['phone_number', 'phone_number_verified'],
      profile: [
        'birthdate',
        'family_name',
        'gender',
        'given_name',
        'locale',
        'middle_name',
        'name',
        'nickname',
        'picture',
        'preferred_username',
        'profile',
        'updated_at',
        'website',
        'zoneinfo',
      ],
    },
    features: {
      devInteractions: { enabled: false }, // defaults to true
      deviceFlow: { enabled: true }, // defaults to false
      revocation: { enabled: true }, // defaults to false
      registration: { enabled: true },
    },
    ttl: {
      AuthorizationCode: 600 /* 10 minutes in seconds */,
      DeviceCode: 600 /* 10 minutes in seconds */,
      Grant: 1209600 /* 14 days in seconds */,
      IdToken: 3600 /* 1 hour in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1209600 /* 14 days in seconds */,
    },
    acrValues: ['0'],
  };
};

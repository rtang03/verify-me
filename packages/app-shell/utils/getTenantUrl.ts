export const getTenantUrl: (slug: string, domain: string, secure?: boolean) => string = (
  slug,
  domain,
  secure = false
) => `${secure ? 'https://' : 'http://'}${slug}.${domain}`;

export const getTenantDid: (slug: string, domain: string, method?: string) => string = (
  slug,
  domain,
  method = 'web'
) => `did:${method}:${slug}.${domain}`;

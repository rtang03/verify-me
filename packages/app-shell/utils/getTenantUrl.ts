export const getTenantUrl: (slug: string, domain: string, secure?: boolean) => string = (
  slug,
  domain,
  secure = false
) => `${secure ? 'https://' : 'http://'}${slug}.${domain}`;

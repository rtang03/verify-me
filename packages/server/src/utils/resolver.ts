type Extensible = Record<string, any>;

export interface DIDResolutionResult {
  didResolutionMetadata: DIDResolutionMetadata;
  didDocument: DIDDocument | null;
  didDocumentMetadata: DIDDocumentMetadata;
}

export interface DIDResolutionOptions extends Extensible {
  accept?: string;
}

export interface DIDResolutionMetadata extends Extensible {
  contentType?: string;
  error?:
    | 'invalidDid'
    | 'notFound'
    | 'representationNotSupported'
    | 'unsupportedDidMethod'
    | string;
}

export interface DIDDocumentMetadata extends Extensible {
  created?: string;
  updated?: string;
  deactivated?: boolean;
  versionId?: string;
  nextUpdate?: string;
  nextVersionId?: string;
  equivalentId?: string;
  canonicalId?: string;
}

export interface DIDDocument {
  '@context'?: 'https://www.w3.org/ns/did/v1' | string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: ServiceEndpoint[];
  /**
   * @deprecated
   */
  publicKey?: VerificationMethod[];
}

export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string;
  description?: string;
}

interface JsonWebKey extends Extensible {
  alg?: string;
  crv?: string;
  e?: string;
  ext?: boolean;
  key_ops?: string[];
  kid?: string;
  kty: string;
  n?: string;
  use?: string;
  x?: string;
  y?: string;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58?: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyHex?: string;
  blockchainAccountId?: string;
  ethereumAddress?: string;
}

export interface Params {
  [index: string]: string;
}

export interface ParsedDID {
  did: string;
  didUrl: string;
  method: string;
  id: string;
  path?: string;
  fragment?: string;
  query?: string;
  params?: Params;
}

export type DIDResolver = (
  did: string,
  parsed: ParsedDID,
  resolver: Resolver,
  options: DIDResolutionOptions
) => Promise<DIDResolutionResult>;
export type WrappedResolver = () => Promise<DIDResolutionResult>;
export type DIDCache = (
  parsed: ParsedDID,
  resolve: WrappedResolver
) => Promise<DIDResolutionResult>;
export type LegacyDIDResolver = (
  did: string,
  parsed: ParsedDID,
  resolver: Resolver
) => Promise<DIDDocument>;

export interface ResolverRegistry {
  [index: string]: DIDResolver;
}

export interface LegacyResolverRegistry {
  [index: string]: LegacyDIDResolver;
}

export interface ResolverOptions {
  cache?: DIDCache | boolean | undefined;
  legacyResolvers?: LegacyResolverRegistry;
}

export function inMemoryCache(): DIDCache {
  const cache: Map<string, DIDResolutionResult> = new Map();
  return async (parsed: ParsedDID, resolve) => {
    if (parsed.params && parsed.params['no-cache'] === 'true') return await resolve();

    const cached = cache.get(parsed.didUrl);
    if (cached !== undefined) return cached;
    const result = await resolve();
    if (result.didResolutionMetadata?.error !== 'notFound') {
      cache.set(parsed.didUrl, result);
    }
    return result;
  };
}

export function noCache(parsed: ParsedDID, resolve: WrappedResolver): Promise<DIDResolutionResult> {
  return resolve();
}

const ID_CHAR = '[a-zA-Z0-9_.%-]';
const METHOD = '([a-zA-Z0-9_]+)';
const METHOD_ID = `(${ID_CHAR}+(:${ID_CHAR}+)*)`;
const PARAM_CHAR = '[a-zA-Z0-9_.:%-]';
const PARAM = `;${PARAM_CHAR}+=${PARAM_CHAR}*`;
const PARAMS = `((${PARAM})*)`;
const PATH = `(\/[^#?]*)?`;
const QUERY = `([?][^#]*)?`;
const FRAGMENT = `(\#.*)?`;
const DID_MATCHER = new RegExp(`^did:${METHOD}:${METHOD_ID}${PARAMS}${PATH}${QUERY}${FRAGMENT}$`);
export function parse(didUrl: string): ParsedDID | null {
  if (didUrl === '' || !didUrl) return null;
  const sections = didUrl.match(DID_MATCHER);
  if (sections) {
    const parts: ParsedDID = {
      did: `did:${sections[1]}:${sections[2]}`,
      method: sections[1],
      id: sections[2],
      didUrl,
    };
    if (sections[4]) {
      const params = sections[4].slice(1).split(';');
      parts.params = {};
      for (const p of params) {
        const kv = p.split('=');
        parts.params[kv[0]] = kv[1];
      }
    }
    if (sections[6]) parts.path = sections[6];
    if (sections[7]) parts.query = sections[7].slice(1);
    if (sections[8]) parts.fragment = sections[8].slice(1);
    return parts;
  }
  return null;
}

const EMPTY_RESULT: DIDResolutionResult = {
  didResolutionMetadata: {},
  didDocument: null,
  didDocumentMetadata: {},
};

export function wrapLegacyResolver(resolve: LegacyDIDResolver): DIDResolver {
  return async (did, parsed, resolver) => {
    try {
      const doc = await resolve(did, parsed, resolver);
      return {
        ...EMPTY_RESULT,
        didResolutionMetadata: { contentType: 'application/did+ld+json' },
        didDocument: doc,
      };
    } catch (e) {
      return {
        ...EMPTY_RESULT,
        didResolutionMetadata: {
          error: 'notFound',
          message: e.toString(), // This is not in spec, nut may be helpful
        },
      };
    }
  };
}

export type Resolvable = {
  resolve: (didUrl: string, options?: DIDResolutionOptions) => Promise<DIDResolutionResult>;
};

export class Resolver implements Resolvable {
  private registry: ResolverRegistry;
  private cache: DIDCache;

  constructor(registry: ResolverRegistry = {}, options: ResolverOptions = {}) {
    this.registry = registry;
    this.cache = options.cache === true ? inMemoryCache() : options.cache || noCache;
    if (options.legacyResolvers) {
      Object.keys(options.legacyResolvers).map((methodName) => {
        if (!this.registry[methodName]) {
          this.registry[methodName] = wrapLegacyResolver(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            options.legacyResolvers![methodName]
          );
        }
      });
    }
  }

  async resolve(didUrl: string, options: DIDResolutionOptions = {}): Promise<DIDResolutionResult> {
    const parsed = parse(didUrl);
    console.log('Parsed: ', parsed);
    if (parsed === null) {
      return {
        ...EMPTY_RESULT,
        didResolutionMetadata: { error: 'invalidDid' },
      };
    }
    const resolver = this.registry[parsed.method];
    if (!resolver) {
      return {
        ...EMPTY_RESULT,
        didResolutionMetadata: { error: 'unsupportedDidMethod' },
      };
    }
    return this.cache(parsed, () => resolver(parsed.did, parsed, this, options));
  }
}

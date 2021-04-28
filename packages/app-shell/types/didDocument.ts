import type { DIDDocument } from 'did-resolver';

export type DidDocument = DIDDocument & { description?: string };

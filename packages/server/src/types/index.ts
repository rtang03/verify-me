import type { DidDocument } from './didDocument';
import type { Paginated } from './paginated';

export * from './createDidDocumentPayload';
export * from './commonResponse';
export * from './paginated';
export * from './didDocument';

export type PaginatedDIDDocument = Paginated<DidDocument>;

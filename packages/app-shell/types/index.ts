import type { DidDocument } from './didDocument';
import type { Paginated } from './paginated';

export * from './userInfo';
export * from './didDocument';
export * from './commonResponse';

export type PaginatedDIDDocument = Paginated<DidDocument>;

import type { CommonResponse } from './commonResponse';
import type { DidDocument } from './didDocument';
import type { Paginated } from './paginated';

export * from './commonResponse';
export * from './paginated';
export * from './didDocument';

export type PaginatedDIDDocument = Paginated<DidDocument>;
export type GetPaginatedDidDocument = CommonResponse<Paginated<DidDocument>>;

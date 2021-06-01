import type { IIdentifier } from '@veramo/core';
import type { Paginated, Tenant } from '@verify/server';

export * from './userInfo';
export * from './commonResponse';
export * from './tenantInfo';

export type PaginatedTenant = Paginated<Partial<Tenant>>;
export type PartialTenant = Partial<Tenant>;
export type PaginatedIIdentifier = Paginated<IIdentifier>

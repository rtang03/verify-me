import type { Paginated, Tenant } from '@verify/server';

export * from './userInfo';
export * from './commonResponse';

export type PaginatedTenant = Paginated<Partial<Tenant>>;
export type PartialTenant = Partial<Tenant>;

import pick from 'lodash/pick';
import type { PaginatedTenant, TenantInfo } from '../types';

export const getTenantInfo: (tenant: PaginatedTenant | null | undefined) => TenantInfo | null = (
  tenant
) => (tenant ? pick(tenant.items[0], 'id', 'slug', 'name', 'activated', 'members') : null);

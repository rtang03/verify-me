import { useRouter } from 'next/router';
import type { PaginatedTenant, TenantInfo } from '../types';
import { getTenantInfo } from './getTenantInfo';
import { useReSWR } from './useReSWR';

export const useTenant: () => {
  tenantInfo: TenantInfo | null;
  slug: string | undefined;
  tenantError: any;
  tenantLoading: boolean;
  isTenantError: boolean;
} = () => {
  const router = useRouter();
  const tenantId = router.query.tenant as string;

  // Query TenantInfo
  const {
    data,
    isError: isTenantError,
    isLoading: tenantLoading,
    error: tenantError,
  } = useReSWR<PaginatedTenant>(`/api/tenants?id=${tenantId}`, tenantId !== '0');
  const tenantInfo = getTenantInfo(data);
  const slug = tenantInfo?.slug;

  return {
    tenantInfo,
    slug,
    tenantError,
    tenantLoading,
    isTenantError,
  };
};

import { mutate } from 'swr';
import type { PaginatedTenant, TenantInfo } from '../types';
import { getTenantInfo } from './getTenantInfo';
import { useFetcher } from './useFetcher';
import { useReSWR } from './useReSWR';

type PsqlUpdateReturnType = {
  affected: number;
  generatedMaps: any[];
  raw: any[];
};

export const useActiveTenant: (activeTenantId?: string) => {
  activeTenant: TenantInfo | null;
  updateActiveTenantResult: boolean;
  updateActiveTenant: (userId: string, active_tenant: string) => Promise<any>;
} = (activeTenantId) => {
  // GET ACTIVE TENANT
  const { data: persistedActiveTenant } = useReSWR<PaginatedTenant>(
    `/api/tenants?id=${activeTenantId}`,
    !!activeTenantId
  );
  const activeTenant = getTenantInfo(persistedActiveTenant);

  // SET ACTIVE TENANT
  const { val, updater } = useFetcher<PsqlUpdateReturnType>();
  const updateActiveTenant = async (userId: string, active_tenant: string) => {
    const result = await updater(`/api/nextAuthUsers?id=${userId}`, { active_tenant });
    await mutate(`/api/nextAuthUsers?id=${userId}`);
    return result;
  };

  return { activeTenant, updateActiveTenant, updateActiveTenantResult: val.data?.affected === 1 };
};

// should return
// {
//   "status": "OK",
//   "data": {
//   "generatedMaps": [],
//     "raw": [],
//     "affected": 1
// }
// }

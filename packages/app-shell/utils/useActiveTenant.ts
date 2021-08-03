import { mutate } from 'swr';
import type { PaginatedTenant, TenantInfo, User as NextAuthUser } from '../types';
import { getTenantInfo } from './getTenantInfo';
import { useFetcher } from './useFetcher';
import { useReSWR } from './useReSWR';

type PsqlUpdateReturnType = {
  affected: number;
  generatedMaps: any[];
  raw: any[];
};

export const useActiveTenant: (option: { activeTenantId?: string; user?: NextAuthUser }) => {
  activeTenant: TenantInfo | null;
  updateActiveTenantResult: boolean;
  updateActiveTenant: (userId: string, active_tenant: string) => Promise<any>;
} = ({ activeTenantId, user }) => {
  // GET ACTIVE TENANT
  const { data: persistedActiveTenant } = useReSWR<PaginatedTenant>(
    `/api/tenants?id=${activeTenantId}`,
    !!activeTenantId
  );
  const activeTenant = getTenantInfo(persistedActiveTenant);

  // SET ACTIVE TENANT
  const { val, updater } = useFetcher<PsqlUpdateReturnType>();
  const updateActiveTenant = async (userId: string, active_tenant: string) => {
    await mutate(`/api/nextAuthUsers?id=${userId}`, { ...user, active_tenant }, false);
    await updater(`/api/nextAuthUsers?id=${userId}`, { active_tenant });
    await mutate(`/api/nextAuthUsers?id=${userId}`);
  };

  return { activeTenant, updateActiveTenant, updateActiveTenantResult: val.data?.affected === 1 };
};

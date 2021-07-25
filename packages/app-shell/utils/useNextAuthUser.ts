import type { PaginatedNextAuthUser } from '../types';
import { useReSWR } from './useReSWR';

export const useNextAuthUser = (userId?: string) => {
  const { data: users } = useReSWR<PaginatedNextAuthUser>(`/api/nextAuthUsers?id=${userId}`);
  const activeUser = users?.items?.[0];

  return { activeUser };
};

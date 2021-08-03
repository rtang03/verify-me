import type { PaginatedIIdentifier } from '../types';
import { useReSWR } from './useReSWR';

// it returns all available identifier of active tenant
export const useQueryIdentifier: (option: {
  slug: string | undefined;
  cursor?: number;
  pageSize?: number;
  shouldFetch: boolean;
}) => {
  count?: number;
  paginatedIdentifier: PaginatedIIdentifier | null | undefined;
  isQueryIdentifierLoading: boolean;
  isQueryIdentifierError: boolean;
  queryIdentifierError: any;
} = ({ slug, shouldFetch, cursor = 0, pageSize = 5 }) => {
  // where-clause filter out empty IIdentifier, created by automically cascaded insert of TypeORM
  const args = { where: [{ column: 'provider', op: 'Equal', value: ['did:web'] }] };
  const url = slug
    ? `/api/users?slug=${slug}&cursor=${cursor}&pagesize=${pageSize}&args=${JSON.stringify(args)}`
    : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedIIdentifier>(url, shouldFetch);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / pageSize));

  return {
    count,
    paginatedIdentifier: data,
    isQueryIdentifierLoading: isLoading,
    isQueryIdentifierError: isError,
    queryIdentifierError: error,
  };
};

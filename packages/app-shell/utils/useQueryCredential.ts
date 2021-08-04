import type { PaginatedVerifiableCredential } from '../types';
import { useReSWR } from './useReSWR';

export const useQueryCredential: (option: {
  slug: string | undefined;
  cursor?: number;
  pageSize?: number;
  shouldFetch: boolean;
}) => {
  count?: number;
  paginatedCredential: PaginatedVerifiableCredential | null | undefined;
  isQueryCredentialLoading: boolean;
  isQueryCredentialError: boolean;
  queryCredentialError: any;
} = ({ slug, shouldFetch, cursor = 0, pageSize = 5 }) => {
  // TODO: need to refine the where-clause
  // const args = { where: [{ column: 'subject', op: 'IsNull', not: true }] };
  // const url = slug
  //   ? `/api/credentials?slug=${slug}&cursor=${cursor}&pagesize=${pageSize}&args=${JSON.stringify(
  //       args
  //     )}`
  //   : null;
  const url = slug ? `/api/credentials?slug=${slug}&cursor=${cursor}&pagesize=${pageSize}}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedVerifiableCredential>(
    url,
    shouldFetch
  );
  let count;
  data && !isLoading && (count = Math.ceil(data.total / pageSize));

  return {
    count,
    paginatedCredential: data,
    isQueryCredentialLoading: isLoading,
    isQueryCredentialError: isError,
    queryCredentialError: error,
  };
};

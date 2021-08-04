import type { PaginatedMessage } from '../types';
import { useReSWR } from './useReSWR';

export const useQueryPaginatedMessage: (option: {
  slug: string | undefined;
  cursor?: number;
  pageSize?: number;
  shouldFetch: boolean;
}) => {
  count?: number;
  paginatedMessage: PaginatedMessage | null | undefined;
  isQueryMessageLoading: boolean;
  isQueryMessageError: boolean;
  queryMessageError: any;
} = ({ slug, shouldFetch, cursor = 0, pageSize = 5 }) => {
  const url = slug ? `/api/messages?slug=${slug}&cursor=${cursor}&pagesize=${pageSize}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedMessage>(url, shouldFetch);

  let count;
  data && !isLoading && (count = Math.ceil(data.total / pageSize));

  return {
    count,
    paginatedMessage: data,
    isQueryMessageLoading: isLoading,
    isQueryMessageError: isError,
    queryMessageError: error,
  };
};

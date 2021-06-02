import useSWR from 'swr';
import type { CommonResponse } from '../types';
import { NOT_FOUND } from './constants';

const fetcher = (args: any) => fetch(args).then((res) => res.json());

export type Result<TData> = {
  data: TData | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

/**
 * A fetcher by useSWR
 */
export const useReSWR: <TData>(
  baseUrl: string | null,
  shouldFetch?: boolean
) => Result<TData> = <TData>(
  baseUrl: string | null,
  shouldFetch: boolean | undefined
) => {
  // @see https://swr.vercel.app/docs/conditional-fetching
  let args: any = shouldFetch === undefined ? baseUrl : shouldFetch ? baseUrl : null;

  // if no baseUrl because of no awaiting tenantInfo, args is set to null; as a dependent fetching
  if (!baseUrl) args = null;

  const { data, error } = useSWR<CommonResponse<TData>>(args, fetcher);

  // Not found: no data, no error
  return data?.status === 'OK'
    ? <Result<TData>>{
        data: data.data,
        isLoading: !error && !data,
        isError: false,
        error,
      }
    : data?.status === NOT_FOUND
    ? <Result<TData>>{
        data: null,
        isLoading: !error && !data,
        isError: false,
        error,
      }
    : <Result<TData>>{
        data: null,
        isLoading: !error && !data,
        isError: true,
        error,
      };
};

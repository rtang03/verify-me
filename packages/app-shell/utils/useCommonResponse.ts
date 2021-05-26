import useSWR from 'swr';
import type { CommonResponse } from '../types';

const fetcher = (args: any) => fetch(args).then((res) => res.json());

type Result<TData> = {
  data: TData | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

/**
 * A fetcher by useSWR
 */
export const useCommonResponse: <TData>(baseUrl: string, id?: string) => Result<TData> = <TData>(
  baseUrl: string,
  id: string | undefined
) => {
  const { data, error } = id
    ? useSWR<CommonResponse<TData>>(`${baseUrl}?id=${id}`, fetcher)
    : useSWR<CommonResponse<TData>>(baseUrl, fetcher);

  // The returned data should be CommonResponse

  const result: Result<TData> =
    data?.status === 'OK'
      ? {
          data: data.data,
          isLoading: !error && !data,
          isError: false,
          error,
        }
      : {
          data: null,
          isLoading: !error && !data,
          isError: true,
          error,
        };
  return result;
};

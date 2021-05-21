import useSWR from 'swr';
import type { CommonResponse } from '../types';

const fetcher = (args: any) => fetch(args).then((res) => res.json());

type Result<TData> = {
  data: TData | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

export const useCommonResponse: <TData>(id?: string) => Result<TData> = <TData>(
  id: string | undefined
) => {
  const { data, error } = id
    ? useSWR<CommonResponse<TData>>(`/api/tenants?id=${id}`, fetcher)
    : useSWR<CommonResponse<TData>>(`/api/tenants`, fetcher);

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

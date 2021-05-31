import Status from 'http-status';
import React, { useState } from 'react';

interface State<TData = any> {
  data: TData | null;
  loading: boolean;
  error: any;
}

const createFetcher: <TValue>(
  val: TValue,
  setVal: React.Dispatch<any>
) => (url: string, option?: RequestInit) => Promise<any> = (val, setVal) => (url, option) => {
  setVal({ ...val, loading: true });

  return fetch(url, option)
    .then((r) => r.json())
    .then((json) => {
      if (json?.status === 'OK')
        setVal((value: any) => ({ ...value, data: json.data, status: json.status }));
      else setVal((value: any) => ({ ...value, error: json.error, status: json.status }));
    })
    .catch((error) => setVal((value: any) => ({ ...value, error })))
    .finally(() => setVal((value: any) => ({ ...value, loading: false })));
};

const createPoster: <TValue>(
  val: TValue,
  setVal: React.Dispatch<any>
) => (url: string, body?: any) => Promise<any> = (val, setVal) => (url, body) => {
  setVal({ ...val, loading: true });

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((json) => {
      if (json?.status === 'OK')
        setVal((value: any) => ({
          ...value,
          data: json.data,
          status: json.status,
          loading: false,
        }));
      else
        setVal((value: any) => ({
          ...value,
          error: json.error,
          status: json.status,
          loading: false,
        }));
    })
    .catch((error) => setVal((value: any) => ({ ...value, error, loading: false })));
};

const createUpdater: <TValue>(
  val: TValue,
  setVal: React.Dispatch<any>
) => (url: string, body?: any) => Promise<any> = (val, setVal) => (url, body) => {
  setVal({ ...val, loading: true });

  return fetch(url, {
    method: 'PUT',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((json) => {
      if (json?.status === 'OK')
        setVal((value: any) => ({
          ...value,
          data: json.data,
          status: json.status,
          loading: false,
        }));
      else
        setVal((value: any) => ({
          ...value,
          error: json.error,
          status: json.status,
          loading: false,
        }));
    })
    .catch((error) => setVal((value: any) => ({ ...value, error, loading: false })));
};

/**
 * A non useSWR fetcher
 */
export const useFetcher = <TData>() => {
  const [val, setVal] = useState<State<TData>>({ data: null, loading: false, error: null });
  const fetcher = createFetcher<State<TData>>(val, setVal);
  const poster = createPoster<State<TData>>(val, setVal);
  const updater = createUpdater<State<TData>>(val, setVal);
  return { val, setVal, fetcher, poster, updater };
};

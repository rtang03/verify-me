import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors } from './catchHandlerError';
import { doFetch } from './doFetch';

const handler: (url: string, methods: string[]) => NextApiHandler = (url, methods) => async (
  req,
  res
) => {
  const method = req.method as string;

  if (!methods.includes(method))
    return res.status(Status.METHOD_NOT_ALLOWED).end('Method Not Allowed');

  return (
    {
      ['GET' as string]: async (id: string | string[] | undefined) =>
        id
          ? doFetch({
              req,
              res,
              url: `${url}/${id}`,
              options: { headers: { authorization: `Bearer kljkljkl;j;` } },
            })
          : doFetch({
              req,
              res,
              url,
              query: `cursor=${req?.query?.cursor ?? 0}&pagesize=${req?.query?.pagesize ?? 10}`,
              options: { headers: { authorization: `Bearer kljkljkl;j;` } },
            }),
      POST: async () =>
        doFetch({
          req,
          res,
          url,
          options: {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
            body: JSON.stringify(req.body),
          },
        }),
      PUT: async (id: string | string[] | undefined) =>
        doFetch({
          req,
          res,
          url: `${url}/${id}`,
          options: {
            method: 'PUT',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json', authorization: `Bearer kljkljkl;j;` },
            body: JSON.stringify(req.body),
          },
        }),
      DELETE: async (id: string | string[] | undefined) =>
        doFetch({
          req,
          res,
          url: `${url}/${id}`,
          options: {
            method: 'DELETE',
            mode: 'cors',
            headers: { authorization: `Bearer kljkljkl;j;` },
          },
        }),
    }[method] ||
    (() => {
      res.setHeader('Allow', methods);
      res.status(Status.METHOD_NOT_ALLOWED).end('Method Not Allowed');
    })
  )(req.query?.id);
};

/**
 * Generic Handler for REST methods
 * - GET /api/items
 * - POST /api/items
 * - GET /api/items/:id
 * - DELETE /api/items/:id
 * - PUT /api/items/:id
 * @param url
 * @param methods
 */
export const createRestHandler = (
  url: string,
  methods: string[] = ['GET', 'POST', 'PUT', 'DELETE']
) => catchHandlerErrors(handler(url, methods));

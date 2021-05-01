import Status from 'http-status';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { OOPS } from './constants';

export const catchHandlerErrors = (
  fn: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>
) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await fn(req, res);
  } catch (e) {
    console.error(e);
    res.status(Status.INTERNAL_SERVER_ERROR).send({ status: 'ERROR', message: OOPS });
  }
};

const doFetch = async (res: NextApiResponse, url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const status = response.status;

  if (status === Status.OK || status === Status.CREATED) {
    const json = await response.json();
    res.status(status).send(json);
  } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
};

const handler: (url: string) => NextApiHandler = (url) => async (req, res) =>
  ((
    {
      ['GET' as string]: async (id: string | string[] | undefined) =>
        id
          ? doFetch(res, `${url}/${id}`, { headers: { authorization: `Bearer kljkljkl;j;` } })
          : doFetch(
              res,
              `${url}?cursor=${req?.query?.cursor ?? 0}&pagesize=${req?.query?.pagesize ?? 10}`,
              { headers: { authorization: `Bearer kljkljkl;j;` } }
            ),
      POST: async () =>
        doFetch(res, url, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
          body: JSON.stringify(req.body),
        }),
      PUT: async (id: string | string[] | undefined) =>
        doFetch(res, `${url}/${id}`, {
          method: 'PUT',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json', authorization: `Bearer kljkljkl;j;` },
          body: JSON.stringify(req.body),
        }),
      DELETE: async (id: string | string[] | undefined) =>
        doFetch(res, `${url}/${id}`, {
          method: 'DELETE',
          mode: 'cors',
          headers: { authorization: `Bearer kljkljkl;j;` },
        }),
    }[req?.method as string] ||
    (() => {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(Status.METHOD_NOT_ALLOWED).end('Method Not Allowed');
    })
  )(req.query?.id));

/**
 * Generic Handler for REST methods
 * - GET /api/items
 * - POST /api/items
 * - GET /api/items/:id
 * - DELETE /api/items/:id
 * - PUT /api/items/:id
 * @param url
 */
export const createRestHandler = (url: string) => catchHandlerErrors(handler(url));

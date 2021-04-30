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
    res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
  }
};

const doFetch = async (res: NextApiResponse, url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const status = response.status;

  if (status === Status.OK || status === Status.CREATED) {
    const json = await response.json();
    res.status(Status.OK).send(json);
  } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
};

const handler: (url: string) => NextApiHandler<any> = (url) => async (req, res) => {
  const method = req?.method as string;
  const id = req.query?.id;

  await (
    {
      ['GET' as string]: async () =>
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
      PUT: async () =>
        doFetch(res, url, {
          method: 'PUT',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json', authorization: `Bearer kljkljkl;j;` },
          body: JSON.stringify(req.body),
        }),
      DELETE: async () =>
        doFetch(res, url, {
          method: 'DELETE',
          mode: 'cors',
          headers: { authorization: `Bearer kljkljkl;j;` },
        }),
    }[method] ||
    (() => {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(Status.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
    })
  )();
};

/**
 * Handler for
 * - GET /api/dids
 * - POST /api/dids
 * - GET /api/dids/:id
 * - DELETE /api/dids/:id
 * - DELETE /api/dids/:id
 * @param url
 */
export const createRestHandler = (url: string) => catchHandlerErrors(handler(url));

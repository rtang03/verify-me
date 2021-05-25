import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors } from './catchHandlerError';
import { doFetch } from './doFetch';

const handler: (domain: string, methods: string[]) => NextApiHandler = (domain, methods) => async (
  req,
  res
) => {
  const method = req.method as string;
  const slug = req.query.slug;
  const action = req.query.action;
  const url = `http://${slug}.${domain}/${action}`;

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
    }[method] ||
    (() => {
      res.setHeader('Allow', methods);
      res.status(Status.METHOD_NOT_ALLOWED).end('Method Not Allowed');
    })
  )(req.query?.id);
};

export const createHandlerByDomain = (url: string, methods: string[] = ['GET', 'POST']) =>
  catchHandlerErrors(handler(url, methods));

import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors } from './catchHandlerError';
import { MISSING_ACTION, MISSING_DOMAIN, MISSING_ID, MISSING_SLUG } from './constants';
import { doFetch } from './doFetch';
import { getTenantUrl } from './getTenantUrl';

const handler: (domain: string, methods: string[]) => NextApiHandler = (domain, methods) => async (
  req,
  res
) => {
  const method = req.method as string;
  const domain = process.env.NEXT_PUBLIC_DOMAIN;
  const slug = req.query.slug as string;
  const action = req.query.action;
  const id = req.query.id as string;

  if (!id) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_ID });
  if (!action) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_ACTION });
  if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
  if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

  const url = `${getTenantUrl(slug, domain)}/actions/${id}/${action}`;

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
      POST: async (id: string | string[] | undefined) =>
        doFetch({
          req,
          res,
          url,
          query: `action=${req?.query?.action}`,
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

export const createHandlerByActions = (url: string, methods: string[] = ['GET', 'POST']) =>
  catchHandlerErrors(handler(url, methods));

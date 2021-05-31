import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors } from './catchHandlerError';
import { MISSING_DOMAIN, MISSING_SLUG, NOT_FOUND, OOPS } from './constants';
import { getTenantUrl } from './getTenantUrl';

const handler: (agentMethod: string) => NextApiHandler = (agentMethod) => async (req, res) => {
  const method = req.method as string;
  const body = req.body;

  if (method === 'POST') {
    const slug = req.query.slug as string;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const response = await fetch(`${getTenantUrl(slug, domain)}/agent/${agentMethod}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(body),
    });

    res.status(Status.OK).send(
      (
        (await {
          [Status.OK]: async () => ({ status: 'OK', data: await response.json() }),
          [Status.OK]: async () => ({ status: 'OK', data: await response.json() }),
        }[response.status as number]) ||
        (async () => ({ status: 'ERROR', message: OOPS, error: await response.text() }))
      )()
    );
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export const createHandlerByAgentMethod: (agentMethod: string) => NextApiHandler = (agentMethod) =>
  catchHandlerErrors(handler(agentMethod));

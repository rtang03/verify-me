import util from 'util';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors } from './catchHandlerError';
import { MISSING_DOMAIN, MISSING_SLUG, OOPS } from './constants';
import { getTenantUrl } from './getTenantUrl';

const handler: (agentMethod: string) => NextApiHandler = (agentMethod) => async (req, res) => {
  const method = req.method as string;
  const body = req.body;

  if (method === 'POST') {
    const slug = req.query.slug as string;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const secure = process.env.NEXT_PUBLIC_DOMAIN_SECURE === 'true';

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const url = `${getTenantUrl(slug, domain, secure)}/agent/${agentMethod}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(body),
    });

    const status = response.status;
    let result;

    if (status === Status.OK || status === Status.CREATED)
      result = { status: 'OK', data: await response.json() };
    else {
      const error = await response.text();
      console.error(util.format('error: %s, %j', agentMethod, error));
      result = { status: 'ERROR', message: OOPS, error };
    }

    res.status(Status.OK).send(result);
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export const createHandlerByAgentMethod: (agentMethod: string) => NextApiHandler = (agentMethod) =>
  catchHandlerErrors(handler(agentMethod));

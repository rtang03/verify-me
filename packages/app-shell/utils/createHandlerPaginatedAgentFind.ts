import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors, getTenantUrl, MISSING_DOMAIN, MISSING_SLUG, OOPS } from '.';

const handler: (agentMethod: string, agentCountMethod: string) => NextApiHandler = (
  agentMethod,
  agentCountMethod
) => async (req, res) => {
  if (req.method === 'GET') {
    const slug = req.query.slug as string;
    const cursor = req.query.cursor as string;
    const skip = (cursor && parseInt(cursor, 10)) || 0;
    const pagesize = req.query.pagesize as string;
    const take = (pagesize && parseInt(pagesize, 10)) || 50;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const getUrl = (method: string) => `${getTenantUrl(slug, domain)}/agent/${method}`;

    // Query Result
    // @see https://veramo.io/docs/api/data-store.where
    const response = await fetch(getUrl(agentMethod), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify({ skip, take }),
    });

    // Query Count
    const countResponse = await fetch(getUrl(agentCountMethod), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify({}),
    });
    const status = response.status;

    let result;

    if (status === Status.OK) {
      const items: any[] = await response.json();
      const total = await countResponse.json();
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      result = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
    } else result = { status: 'ERROR', message: OOPS, error: await response.text() };

    res.status(Status.OK).send(result);
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export const createHandlerPaginatedAgentFind: (
  agentMethod: string,
  agentCountMethod: string
) => NextApiHandler = (agentMethod, agentCountMethod) =>
  catchHandlerErrors(handler(agentMethod, agentCountMethod));

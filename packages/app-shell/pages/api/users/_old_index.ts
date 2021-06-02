import type { IIdentifier } from '@veramo/core';
import type {
  Paginated,
  DataStoreORMGetIdentifiersArgs,
  DataStoreORMGetIdentifiersCountArgs,
  CommonResponse,
} from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { getTenantUrl, MISSING_DOMAIN, MISSING_SLUG, OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  // Note: this is GET method, which in turn invokes agentMethod with POST.
  if (req.method === 'GET') {
    const slug = req.query.slug as string;
    const cursor = req.query.cursor as string;
    const skip = (cursor && parseInt(cursor, 10)) || 0;
    const pagesize = req.query.pagesize as string;
    const take = (pagesize && parseInt(pagesize, 10)) || 50;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const getUrl = (agentMethod: string) => `${getTenantUrl(slug, domain)}/agent/${agentMethod}`;

    // Query Result
    // @see https://veramo.io/docs/api/data-store.where
    const response = await fetch(getUrl('dataStoreORMGetIdentifiers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(<DataStoreORMGetIdentifiersArgs>{ skip, take }),
    });

    // Query Count
    const countResponse = await fetch(getUrl('dataStoreORMGetIdentifiersCount'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(<DataStoreORMGetIdentifiersCountArgs>{}),
    });
    const status = response.status;

    let result;

    if (status === Status.OK) {
      const items: Partial<IIdentifier>[] = await response.json();
      const total = await countResponse.json();
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      result = <CommonResponse<Paginated<Partial<IIdentifier>>>>{
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
    } else result = { status: 'ERROR', message: OOPS, error: await response.text() };

    res.status(Status.OK).send(result);
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

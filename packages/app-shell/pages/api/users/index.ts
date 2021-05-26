import type { IIdentifier } from '@veramo/core';
import type {
  Paginated,
  DataStoreORMGetIdentifiersArgs,
  DataStoreORMGetIdentifiersCountArgs,
  CommonResponse,
} from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    // TODO Change to paginated
    const skip = 0;
    const take = 50;
    // Query Result
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/dataStoreORMGetIdentifiers`;
    const args: DataStoreORMGetIdentifiersArgs = {
      skip,
      take,
      // https://veramo.io/docs/api/data-store.where
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(args),
    });

    // Query Count
    const countUrl = `${process.env.NEXT_PUBLIC_BACKEND}/agent/dataStoreORMGetIdentifiersCount`;
    const args2: DataStoreORMGetIdentifiersCountArgs = {};
    const countResponse = await fetch(countUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(args2),
    });

    const status = response.status;

    if (status === Status.OK) {
      const items: Partial<IIdentifier>[] = await response.json();
      const total = await countResponse.json();
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const result: CommonResponse<Paginated<Partial<IIdentifier>>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
      return res.status(Status.OK).send(result);
    } else {
      console.error(`fail to fetch ${url}, status: ${status}`);
      return res.status(Status.OK).send({ status: 'ERROR', message: OOPS });
    }
  }

  res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

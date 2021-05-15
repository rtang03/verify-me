import type {
  DataStoreORMGetMessagesArgs,
  DataStoreORMGetMessagesCountArgs,
  CommonResponse,
  IMessage,
  Paginated,
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
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/agent/dataStoreORMGetMessages`;
    const args: DataStoreORMGetMessagesArgs = {
      skip,
      take,
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(args),
    });

    // Query Count
    const countUrl = `${process.env.NEXT_PUBLIC_BACKEND}/agent/dataStoreORMGetMessagesCount`;
    const args2: DataStoreORMGetMessagesCountArgs = {};
    const countResponse = await fetch(countUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(args2),
    });

    const status = response.status;

    if (status === Status.OK) {
      const items: IMessage[] = await response.json();
      const total = await countResponse.json();
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const result: CommonResponse<Paginated<IMessage>> = {
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
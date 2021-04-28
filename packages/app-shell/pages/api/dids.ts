import Status from 'http-status';
import type { NextApiHandler } from 'next';
import type { PaginatedDIDDocument } from '../../types';

const handler: NextApiHandler = (req, res) => {
  const data: PaginatedDIDDocument = {
    total: 1,
    items: [{ id: '123', description: 'hello' }],
    cursor: 0,
    hasMore: false,
  };

  res.status(Status.OK).send({ status: 'OK', data });
};

export default handler;

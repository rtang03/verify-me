import type { GetPaginatedDidDocument } from '@verify/server';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { catchHandlerErrors, OOPS } from '../../utils';

const handler: NextApiHandler = async (req, res) => {
  const cursor = req?.query?.cursor ?? 0;
  const pagesize = req?.query?.pagesize ?? 10;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/dids?cursor=${cursor}&pagesize=${pagesize}`
  );

  if (response.status === Status.OK) {
    // TODO: replace it with TypeGuard checking
    const json: GetPaginatedDidDocument = await response.json();
    res.status(Status.OK).send(json);
  } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
};

export default catchHandlerErrors(handler);

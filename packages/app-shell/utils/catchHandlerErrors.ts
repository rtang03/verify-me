import Status from 'http-status';
import { NextApiRequest, NextApiResponse } from 'next';
import { OOPS } from './constants';

export const catchHandlerErrors = (
  fn: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>
) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await fn(req, res);
  } catch (e) {
    console.error(e);
    res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
  }
};

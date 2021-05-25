import Status from 'http-status';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { OOPS } from './constants';

export const doFetch = async (args: {
  req: NextApiRequest;
  res: NextApiResponse;
  url: string;
  query?: string;
  options?: RequestInit;
}) => {
  const { req, res, url, query, options } = args;
  const session = (await getSession({ req })) as any;
  const user_id = session?.user?.id;

  if (!user_id) return res.status(Status.OK).send({ data: 'protected' });

  const urlWithUserId = query ? `${url}?${query}&user_id=${user_id}` : `${url}?user_id=${user_id}`;
  const response = await fetch(urlWithUserId, options);
  const { status } = response;

  return status === Status.OK || status === Status.CREATED
    ? res.status(status).send(await response.json())
    : res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
};

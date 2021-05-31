import Status from 'http-status';
import type { NextApiHandler } from 'next';
import {
  catchHandlerErrors,
  getTenantUrl,
  MISSING_DOMAIN,
  MISSING_SLUG,
  NOT_FOUND,
  OOPS,
} from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const slug = req.query.slug as string;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const response = await fetch(`${getTenantUrl(slug, domain)}/.well-known/did.json`);

    res.status(Status.OK).send(
      (
        (await {
          [Status.OK]: async () => ({ status: 'OK', data: await response.json() }),
          [Status.NOT_FOUND]: async () => ({ status: NOT_FOUND, data: null, message: NOT_FOUND }),
        }[response.status as number]) ||
        (async () => ({ status: 'ERROR', message: OOPS, error: await response.text() }))
      )()
    );
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default catchHandlerErrors(handler);

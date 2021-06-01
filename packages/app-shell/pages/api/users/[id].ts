import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { getTenantUrl, MISSING_DOMAIN, MISSING_SLUG, OOPS } from '../../../utils';

// This is an unusual method, "didManagerFind" is POST
// This handler accept GET, and invoke a POST
// Also, it removes the privateKey from the result payload
// This is a customized version of "createHandlerByAgentMethod"
const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const slug = req.query.slug as string;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const alias = (req.query.id as string) || '';

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const url = `${getTenantUrl(slug, domain)}/agent/didManagerFind`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify({ alias }),
    });
    const status = response.status;

    if (status === Status.OK) {
      const json = await response.json();
      const data = json?.map((item: any) => ({
        ...item,
        keys: item.keys.map((key: any) => ({ ...key, privateKeyHex: '********' })),
      }));
      res.status(Status.OK).send({ status: 'OK', data: data[0] });
    } else res.status(Status.OK).send({ status: 'ERROR', message: OOPS });
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

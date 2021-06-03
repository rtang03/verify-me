import type { IDataStoreGetVerifiableCredentialArgs } from '@veramo/core';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { getTenantUrl, MISSING_DOMAIN, MISSING_SLUG, OOPS } from '../../../utils';

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const slug = req.query.slug as string;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const secure = process.env.NEXT_PUBLIC_DOMAIN_SECURE === 'true';
    const hash = req.query.id as string;

    if (!slug) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_SLUG });
    if (!domain) return res.status(Status.OK).send({ status: 'ERROR', error: MISSING_DOMAIN });

    const url = `${getTenantUrl(slug, domain, secure)}/agent/dataStoreGetVerifiableCredential`;
    const args: IDataStoreGetVerifiableCredentialArgs = { hash };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(args),
    });
    const status = response.status;

    if (status === Status.OK) {
      const data = await response.json();

      res.status(Status.OK).send({ status: 'OK', data });
    } else
      res.status(Status.OK).send({ status: 'ERROR', message: OOPS, error: await response.text() });
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR', message: OOPS });
};

export default handler;

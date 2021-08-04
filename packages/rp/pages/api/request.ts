import util from 'util';
import { serialize, CookieSerializeOptions } from 'cookie';
import Status from 'http-status';
import type { NextApiHandler, NextApiResponse } from 'next';
import { Issuer, generators } from 'openid-client';

const OOPS = 'Oops';

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

  if (options?.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge);
    options.maxAge /= 1000;
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options));
};

const handler: NextApiHandler = async (req, res) => {
  // const issuer = await Issuer.discover(
  //   'https://issuer.example.com/oidc/issuers/0ac6d292-1868-44d3-a161-923052e11fb8'
  // );
  if (req.method === 'POST') {
    const url = `https://issuer.example.com/agent/createSelectiveDisclosureRequest`;

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    // Use call-and-forward
    const body = req.body;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
      body: JSON.stringify(body),
    });
    const status = response.status;
    let result;

    if (status === Status.OK || status === Status.CREATED) {
      result = { status: 'OK', data: { sdr: await response.json(), challenge: code_challenge } };
      setCookie(res, 'code_verifier', code_verifier);
    } else {
      const error = await response.text();
      console.error(util.format('error: %j', error));
      result = { status: 'ERROR', message: OOPS, error };
    }

    res.status(Status.OK).send(result);
    res.end();

    // Use redirect
    // res.status(Status.FOUND).send({ Location: url });
    // res.end();
  } else res.status(Status.METHOD_NOT_ALLOWED).send({ status: 'ERROR' });
};

export default handler;

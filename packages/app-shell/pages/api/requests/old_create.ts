import Debug from 'debug';
import Status from 'http-status';
import type { NextApiHandler } from 'next';
import { OOPS } from '../../../utils';

/**
 * DON'T DELETE ME. MAY BE USEFUL LATER
 */
const debug = Debug('app-shell:api:requests:create');

const doFetch: ([data, error]: [data: any, error?: any]) => (
  url: string,
  callback: (input: any) => any
) => Promise<[data: any, error: any]> = (input) => async (url, callback) => {
  if (input[1]) return [null, null];

  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer jklj;kljkl` },
    body: JSON.stringify(callback(input[0])),
  });

  if (result.status === Status.OK) {
    const data = await result.json();
    return [data, null];
  } else {
    const error = await result.text();
    return [null, error];
  }
};

const handler: NextApiHandler = async (req, res) => {
  const method = req.method;
  const issuer = req.body.issuer;
  const subject = req.body.subject;
  const sdrArgs = { data: req.body };
  const sdrUrl = `${process.env.NEXT_PUBLIC_BACKEND}/agent/createSelectiveDisclosureRequest`;
  const handleMessageUrl = `${process.env.NEXT_PUBLIC_BACKEND}/agent/handleMessage`;
  // const sendMessageUrl = `${process.env.NEXT_PUBLIC_BACKEND}/agent/sendMessageDIDCommAlpha1`;

  if (method === 'POST') {
    const fetch1 = await doFetch([sdrArgs])(sdrUrl, (input) => input);
    const fetch2 = await doFetch(fetch1)(handleMessageUrl, (sdr) => ({ raw: sdr, save: true }));
    // const fetch3 = await doFetch(fetch1)(sendMessageUrl, (sdr) => ({
    //   data: {
    //     to: subject,
    //     from: issuer,
    //     type: 'jwt',
    //     body: sdr,
    //   },
    //   save: true,
    // }));

    const data = [fetch1[0], fetch2[0]];
    // const data = [fetch1[0], fetch2[0], fetch3[0]];
    // const error = [fetch1[1], fetch2[1], fetch3[1]];
    const error = [fetch1[1], fetch2[1]];
    if (fetch1[0] && fetch2[0]) {
      const result = { status: 'OK', data };
      res.status(Status.OK).send(result);
    } else res.status(Status.OK).send({ status: 'ERROR', message: OOPS, data, error });
  }
};

export default handler;

// const selectiveDisclosureRequest = {
//   data: {
//     issuer: 'did:web:e6d660941749.ngrok.io',
//     subject: 'did:web:e6d660941749.ngrok.io:users:peter',
//     claims: [
//       {
//         claimType: 'gender',
//         claimValue: 'm',
//         issuers: [
//           {
//             did: 'did:web:e6d660941749.ngrok.io',
//             url: 'http://e6d660941749.ngrok.io',
//           },
//         ],
//         essential: false,
//         reason: 'testing',
//       },
//     ],
//     replyUrl: '',
//   },
// };

// const savedMessage = {
//   raw:
//     'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE2MjA4MTIzNjMsInR5cGUiOiJzZHIiLCJzdWJqZWN0IjoiZGlkOndlYjplNmQ2NjA5NDE3NDkubmdyb2suaW86dXNlcnM6cGV0ZXIiLCJjbGFpbXMiOlt7ImNsYWltVHlwZSI6ImdlbmRlciIsImNsYWltVmFsdWUiOiJtIiwiaXNzdWVycyI6W3siZGlkIjoiZGlkOndlYjplNmQ2NjA5NDE3NDkubmdyb2suaW8iLCJ1cmwiOiJodHRwOi8vZTZkNjYwOTQxNzQ5Lm5ncm9rLmlvIn1dLCJlc3NlbnRpYWwiOmZhbHNlLCJyZWFzb24iOiJ0ZXN0aW5nIn1dLCJyZXBseVVybCI6IiIsImlzcyI6ImRpZDp3ZWI6ZTZkNjYwOTQxNzQ5Lm5ncm9rLmlvIn0.tjxA9MbQQbicE6gWT_ssVmiIEOF282CkfdlPomUBqvvP1ElgGyTfWjOTD_GSAd2_X629oSLG-EVY6t6tmqk3Dw',
//   metaData: [
//     {
//       type: 'JWT',
//       value: 'ES256K',
//     },
//   ],
//   data: {
//     iat: 1620812363,
//     type: 'sdr',
//     subject: 'did:web:e6d660941749.ngrok.io:users:peter',
//     claims: [
//       {
//         claimType: 'gender',
//         claimValue: 'm',
//         issuers: [
//           {
//             did: 'did:web:e6d660941749.ngrok.io',
//             url: 'http://e6d660941749.ngrok.io',
//           },
//         ],
//         essential: false,
//         reason: 'testing',
//       },
//     ],
//     replyUrl: '',
//     iss: 'did:web:e6d660941749.ngrok.io',
//   },
//   id:
//     '1d39caa9179777e129e853dc68c09dc29005f3d2d3f452a5dca1310316335114900ef79d2ac293a3f7b5992d4f21d01aa3b389e943523cfe8c20ef830155ef68',
//   type: 'sdr',
//   from: 'did:web:e6d660941749.ngrok.io',
//   to: 'did:web:e6d660941749.ngrok.io:users:peter',
//   createdAt: '2021-05-12T09:39:23.000Z',
// };

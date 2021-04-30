// import Status from 'http-status';
// import type { NextApiHandler } from 'next';
// import { NextApiResponse } from 'next';
// import { catchHandlerErrors, OOPS } from '../../../utils';
//
// const doFetch = async (res: NextApiResponse, url: string, options?: RequestInit) => {
//   const response = await fetch(url, options);
//
//   if (response.status === Status.OK) {
//     const json = await response.json();
//     res.status(Status.OK).send(json);
//   } else res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: OOPS });
// };
//
// const handler: (url: string) => NextApiHandler = (url) => async (req, res) => {
//   res.status(200).send({ data: 'ok' });
//   // doFetch(res, url, {
//   //   method: 'POST',
//   //   mode: 'cors',
//   //   headers: {
//   //     'Content-Type': 'application/json'
//   //     // authorization: `Bearer ${token}`
//   //   },
//   //   body: JSON.stringify(req.body)
//   // });
// };
//
// export default catchHandlerErrors(handler(`${process.env.NEXT_PUBLIC_BACKEND}/dids`));

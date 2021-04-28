import Status from 'http-status';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = (req, res) => {
  const {
    query: { id },
  } = req;
  const method = req?.method as string;

  ((
    {
      ['GET' as string]: () => {
        res.status(Status.OK).send({ status: 'OK', data: [] });
      },
      POST: () => {
        res.status(Status.OK).send({ status: 'OK', message: 'done' });
      },
    }[method] &&
    (() => {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
    })
  )());
};

export default handler;

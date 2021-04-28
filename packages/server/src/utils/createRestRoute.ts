import { Request, Response, Router } from 'express';
import Status from 'http-status';

type Action = {
  GET_ALL: (req: Request, res: Response, skip: number, take: number) => Promise<any>;
  GET: (req: Request, res: Response) => Promise<any>;
  POST: (req: Request, res: Response) => Promise<any>;
  DELETE: (req: Request, res: Response) => Promise<any>;
};

export const createRestRoute = ({ GET, GET_ALL, POST, DELETE }: Action) => {
  const router = Router();

  const catchHandlerErrors = (fn: (req: Request, res: Response) => Promise<void>) => async (
    req: Request,
    res: Response
  ) => {
    try {
      await fn(req, res);
    } catch (e) {
      console.error(e);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', message: 'something bad happens' });
    }
  };

  router.get(
    '/',
    catchHandlerErrors(async (req, res) => {
      let skip = 0;
      let take = 10;

      try {
        const cursor = req.query?.cursor as string;
        const pagesize = req.query?.pagesize as string;
        skip = cursor ? parseInt(cursor, 10) : 0;
        take = pagesize ? parseInt(pagesize, 10) : 10;
      } catch {
        res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', message: 'fail to parse cursor / pagesize' });
        return;
      }

      return GET_ALL(req, res, skip, take);
    })
  );

  router.get(
    '/:id',
    catchHandlerErrors(async (req, res) => GET(req, res))
  );

  router.post(
    '/',
    catchHandlerErrors(async (req, res) => POST(req, res))
  );

  router.delete(
    '/:id',
    catchHandlerErrors(async (req, res) => DELETE(req, res))
  );

  router.all('/', (req, res) => {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST']);
    res.status(Status.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`);
  });

  return router;
};

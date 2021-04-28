import util from 'util';
import { Response, Request } from 'express';
import Status from 'http-status';

export const catchErrors: (
  fcn: (req: Request, res: Response) => Promise<any>,
  option: {
    fcnName: string;
  }
) => (req: Request, res: Response) => void = (fcn, { fcnName }) => async (req, res) => {
  try {
    await fcn(req, res);
  } catch (e) {
    console.error(util.format('fail to %s, %j', fcnName, e));
    res.status(Status.BAD_REQUEST).send(e);
  }
};

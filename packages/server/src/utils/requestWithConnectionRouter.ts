import type { Request } from 'express';
import { Router } from 'express';
import type { Connection } from 'typeorm';
import { getConnectionMap } from './connectionManager';

export interface RequestWithConnection extends Request {
  db_connection?: Connection;
}

export const requestwithConnectionRouter: () => Router = () => {
  const router = Router();

  router.use(async (req: RequestWithConnection, res, next) => {
    const slug = req.query.slug as string;

    if (slug) req.db_connection ||= getConnectionMap()[slug];

    next();
  });

  return router;
};

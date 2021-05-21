import { Request, Router } from 'express';
import type { Connection } from 'typeorm';
import { getConnectionPromises } from './connectionManager';

export interface RequestWithConnection extends Request {
  db_connection?: Promise<Connection>;
}

export const requestwithConnectionRouter: () => Router = () => {
  const router = Router();

  router.use(async (req: RequestWithConnection, res, next) => {
    const tenantId = req.query.tenant_id as string;

    if (tenantId) req.db_connection ||= getConnectionPromises()[tenantId];

    next();
  });

  return router;
};

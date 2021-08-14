import { Router } from 'express';
import Status from 'http-status';
import type { Connection } from 'typeorm';
import type { TenantManager } from '../types';

export const createActionsRouter = (commonConnection: Connection, tenantManager: TenantManager) => {
  const router = Router();

  router.post('/:tenant_id/activate', async (req, res) => {
    // todo: Later, use Vhost to double check against tenant_id dervied from access token, as a form of authentication.
    // const slug = req.vhost[0];
    const tenantId = req.params.tenant_id;

    if (!tenantId)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing tenantId' });

    try {
      const data = await tenantManager.activate(tenantId);
      res.status(Status.OK).send({ status: 'OK', data });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  router.post('/:tenant_id/deactivate', async (req, res) => {
    const tenantId = req.params.tenant_id;

    if (!tenantId)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing slug' });

    try {
      const data = await tenantManager.deactivate(tenantId);
      res.status(Status.OK).send({ status: 'Ok', data });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  router.post('/:tenant_id/tenant_status', async (req, res) => {
    const tenantId = req.params.tenant_id;

    if (!tenantId)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing id' });

    try {
      const data = await tenantManager.getTenantStatus(tenantId);
      res.status(Status.OK).send({ status: 'OK', data });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  router.get('/tenant_summary', async (req, res) => {
    try {
      const data = await tenantManager.getTenantSummary();
      res.status(Status.OK).send({ data });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  return router;
};

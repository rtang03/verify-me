import { AgentRouter, RequestWithAgentRouter } from '@veramo/remote-server';
import { Router, Request } from 'express';
import Status from 'http-status';
import { Connection } from 'typeorm';
import type { TenantManager } from '../types';
import type { TTAgent } from '../utils';

const availableMethods = [
  'keyManagerGetKeyManagementSystems',
  'keyManagerCreate',
  'keyManagerGet',
  'keyManagerDelete',
  'keyManagerImport',
  'keyManagerEncryptJWE',
  'keyManagerDecryptJWE',
  'keyManagerSignJWT',
  'keyManagerSignEthTX',
  'didManagerGetProviders',
  'didManagerFind',
  'didManagerGet',
  'didManagerGetByAlias',
  'didManagerCreate',
  'didManagerSetAlias',
  'didManagerGetOrCreate',
  'didManagerImport',
  'didManagerDelete',
  'didManagerAddKey',
  'didManagerRemoveKey',
  'didManagerAddService',
  'didManagerRemoveService',
  'resolveDid',
  'handleMessage',
  'sendMessageDIDCommAlpha1',
  'dataStoreSaveMessage',
  'dataStoreGetMessage',
  'dataStoreSaveVerifiableCredential',
  'dataStoreGetVerifiableCredential',
  'dataStoreSaveVerifiablePresentation',
  'dataStoreGetVerifiablePresentation',
  'createVerifiablePresentation',
  'createVerifiableCredential',
  'dataStoreORMGetIdentifiers',
  'dataStoreORMGetIdentifiersCount',
  'dataStoreORMGetMessages',
  'dataStoreORMGetMessagesCount',
  'dataStoreORMGetVerifiableCredentialsByClaims',
  'dataStoreORMGetVerifiableCredentialsByClaimsCount',
  'dataStoreORMGetVerifiableCredentials',
  'dataStoreORMGetVerifiableCredentialsCount',
  'dataStoreORMGetVerifiablePresentations',
  'dataStoreORMGetVerifiablePresentationsCount',
  'createSelectiveDisclosureRequest',
  'getVerifiableCredentialsForSdr',
  'validatePresentationAgainstSdr',
  'createProfilePresentation',
];

interface RequestWithVhost extends Request {
  vhost?: any;
}

export const createVirualHostRouter = (
  commonConnection: Connection,
  tenantManager: TenantManager
) => {
  const router = Router();

  router.use(
    RequestWithAgentRouter({
      getAgentForRequest: (req: RequestWithVhost) => {
        // NOTE: use VHost
        const agent: TTAgent = tenantManager.getAgents()?.[req.vhost[0]];
        // return agent ? Promise.resolve(agent) : Promise.reject(new Error('Agent not found'));
        return agent ? Promise.resolve(agent) : Promise.resolve(null);
      },
    })
  );

  router.use('/agent', AgentRouter({ exposedMethods: availableMethods }));

  router.post('/actions/:tenant_id/activate', async (req: RequestWithVhost, res) => {
    // todo: Later, use Vhost to double check against tenant_id, as a form of authentication.
    // const slug = req.vhost[0];
    const tenantId = req.params.tenant_id;

    if (!tenantId)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing tenantId' });

    try {
      const data = await tenantManager.activiate(tenantId);
      res.status(Status.OK).send({ status: 'OK', data });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  router.post('/actions/:tenant_id/deactivate', async (req: RequestWithVhost, res) => {
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

  router.get('/actions/:tenant_id/tenant_status', async (req: RequestWithVhost, res) => {
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

  router.get('/actions/tenant_summary', async (req: RequestWithVhost, res) => {
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

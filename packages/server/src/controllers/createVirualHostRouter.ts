import { AgentRouter, RequestWithAgentRouter } from '@veramo/remote-server';
import { Router, Request } from 'express';
import Status from 'http-status';
import { Connection, getConnection } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import type { TTAgent } from '../utils';
import { deactivateTenant, getAgents, isTenantActive } from '../utils';
import { activiateTenant } from '../utils';

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

export const createVirualHostRouter = (commonConnection: Connection) => {
  const router = Router();

  router.use(
    RequestWithAgentRouter({
      getAgentForRequest: (req: RequestWithVhost) => {
        // get agent from connection manager
        const agent: TTAgent = getAgents()?.[req.vhost[0]];
        // return agent ? Promise.resolve(agent) : Promise.reject(new Error('Agent not found'));
        return agent ? Promise.resolve(agent) : Promise.resolve(null);
      },
    })
  );

  router.use('/agent', AgentRouter({ exposedMethods: availableMethods }));

  router.post('/activate_tenant', async (req: RequestWithVhost, res) => {
    const slug = req.vhost[0];

    if (!slug)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing slug' });

    try {
      await activiateTenant(slug, commonConnection);
      res.status(Status.OK).send({ status: 'OK' });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  router.post('/deactivate_tenant', async (req: RequestWithVhost, res) => {
    const slug = req.vhost[0];

    if (!slug)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing slug' });

    try {
      await deactivateTenant(slug);
      res.status(Status.OK).send({ status: 'Ok' });
    } catch (error) {
      console.error(error);
      res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error });
    }
  });

  router.get('/is_tenant_active', (req: RequestWithVhost, res) => {
    const slug = req.vhost[0];

    if (!slug)
      return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing slug' });

    const data = isTenantActive(slug);
    res.status(Status.OK).send({ status: 'OK', data });
  });

  return router;
};

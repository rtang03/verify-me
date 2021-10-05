import { RequestWithAgentRouter } from '@veramo/remote-server';
import type { ICreateSelectiveDisclosureRequestArgs } from '@veramo/selective-disclosure';
import Debug from 'debug';
import { Router, Request, Response, text } from 'express';
import Status from 'http-status';
import pick from 'lodash/pick';
import type { Connection } from 'typeorm';
import type { TenantManager } from '../types';
import type { TTAgent } from '../utils';
import { createDidDocument, exposedMethods } from '../utils';
import { createOidcRoute } from './createOidcRoute';

const debug = Debug('utils:createAgentRouter');
const getAliasForRequest = (req: Request) => encodeURIComponent(req.hostname);
const reservedWord = ['default', 'public'];

interface RequestWithAgent extends Request {
  agent?: TTAgent;
  vhost?: any;
}

export const createAgentRouter = (commonConnection: Connection, tenantManager: TenantManager) => {
  const router = Router();
  // const schemaRouter = ApiSchemaRouter({
  //   exposedMethods,
  //   basePath: '/open-api.json',
  // });

  // 1. setup Agent
  router.use(
    RequestWithAgentRouter({
      getAgentForRequest: async (req: RequestWithAgent) => {
        // baseUrl is /slug/:slug
        // const slug = req.baseUrl.replace('/slug/', '');
        const slug = req.vhost[0];

        if (!slug) return Promise.resolve(null);

        if (reservedWord.includes(slug)) return Promise.reject(new Error('slug name invalid'));

        return Promise.resolve(tenantManager.getAgents()?.[slug]);
      },
    })
  );

  // 2. healthcheck
  router.get('/is_agent_exist', (req: RequestWithAgent, res) =>
    req.agent
      ? res.status(Status.OK).send({ data: 'Agent found' })
      : res.status(Status.OK).send({ data: 'Agent not found' })
  );

  // 3. execute Agent methods
  exposedMethods.forEach((method) =>
    router.post(`/agent/${method}`, async (req: RequestWithAgent, res: Response) => {
      if (!req.agent) return res.status(Status.BAD_GATEWAY).send({ error: 'agent not found' });

      debug('method: ', method);
      debug('body: %O', req.body);

      try {
        const result = await req.agent.execute(method, req.body);

        debug('execute agent method, %O', result);

        res.status(Status.OK).json(result);
      } catch (e) {
        return e.name === 'ValidationError'
          ? res.status(Status.BAD_REQUEST).json({
              ...pick(e, 'message', 'method', 'path', 'code', 'description'),
              name: 'ValidationError',
            })
          : res.status(Status.BAD_GATEWAY).json({ error: e.message });
      }
    })
  );

  // 4. serve .well-known/did.json
  router.get(`/.well-known/did.json`, async (req: RequestWithAgent, res) => {
    if (!req.agent) return res.status(Status.BAD_GATEWAY).send({ error: 'agent not found' });

    try {
      // Note: it returns req.hostname, like "http://issuer.examp.com:3001" will return issuer.example.com
      const alias = getAliasForRequest(req);

      debug('getAliasForRequest: %s', alias);

      const identifier = await req.agent.didManagerGet({ did: `did:web:${alias}` });
      const didDocument = createDidDocument(identifier);

      debug('did-document', didDocument);

      res.status(Status.OK).json(didDocument);
    } catch (error) {
      debug(error.message);

      if (error.message.includes('not found')) {
        res.status(Status.NOT_FOUND).send({ message: error.message });
      } else res.status(Status.BAD_GATEWAY).send({ error });
    }
  });

  router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgent, res) => {
    if (!req.agent) return res.status(Status.BAD_GATEWAY).send({ error: 'agent not found' });

    try {
      const identifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req) + ':' + req.params[0].replace('/', ':'),
      });
      debug('identifier', identifier);

      const didDoc = createDidDocument(identifier);
      debug(didDoc);

      res.status(Status.OK).json(didDoc);
    } catch (e) {
      res.status(Status.NOT_FOUND).send(e);
    }
  });

  // OIDC Router
  router.use('/oidc', createOidcRoute(tenantManager));

  // 5. messaging router
  router.use(text({ type: '*/*' }));
  router.post('/messaging', async (req: RequestWithAgent, res) => {
    if (!req.agent) return res.status(Status.BAD_GATEWAY).send({ error: 'agent not found' });

    try {
      const message = await req.agent?.handleMessage({
        raw: req.body as any as string,
        metaData: [{ type: 'DIDComm' }],
        save: true,
      });

      if (message) {
        console.log('Received message', message.type, message.id);
        res.status(Status.OK).json({ id: message.id });
      }
    } catch (e) {
      console.log(e);
      res.status(Status.BAD_REQUEST).send(e.message);
    }
  });

  // api schema
  // router.use('/open-api.json', schemaRouter);

  router.post('/presentation/requests', async (req: RequestWithAgent, res) => {
    const body = req.body;

    if (!req.agent) return res.status(Status.BAD_GATEWAY).send({ error: 'agent not found' });

    debug('POST /presentation/requests %O', body);

    try {
      const createSdrArgs: ICreateSelectiveDisclosureRequestArgs = {
        data: null,
      };
      const result: string = await req.agent.execute(
        'createSelectiveDisclosureRequest',
        createSdrArgs
      );

      debug('create presentation request, %O', result);
    } catch (e) {
      res.status(Status.BAD_REQUEST).send({ error: e.message });
    }
  });

  return router;
};

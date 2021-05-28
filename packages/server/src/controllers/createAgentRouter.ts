import { RequestWithAgentRouter } from '@veramo/remote-server';
import Debug from 'debug';
import { Router, Request, Response, text } from 'express';
import Status from 'http-status';
import pick from 'lodash/pick';
import type { Connection } from 'typeorm';
import type { TenantManager } from '../types';
import type { TTAgent } from '../utils';
import { createDidDocument, exposedMethods } from '../utils';

const didDocEndpoint = '.well-known/did.json';
const debug = Debug('createAgentRouter');
const getAliasForRequest = (req: Request) => encodeURIComponent(req.hostname);

interface RequestWithAgent extends Request {
  agent: TTAgent;
}

export const createAgentRouter = (commonConnection: Connection, tenantManager: TenantManager) => {
  const router = Router();
  // const schemaRouter = ApiSchemaRouter({
  //   exposedMethods,
  //   basePath: '/open-api.json',
  // });

  // 1. setup Agent
  router.use(
    '/:slug',
    RequestWithAgentRouter({
      getAgentForRequest: (req) => {
        // baseUrl is /slug/:slug
        const slug = req.baseUrl.replace('/slug/', '');
        const agent: TTAgent = tenantManager.getAgents()?.[slug];
        return agent ? Promise.resolve(agent) : Promise.resolve(null);
      },
    })
  );

  // 2. healthcheck
  router.get('/:slug/is_agent_exist', (req: RequestWithAgent, res) =>
    req.agent
      ? res.status(Status.OK).send({ data: 'Agent found' })
      : res.status(Status.OK).send({ data: 'Agent not found' })
  );

  // 3. execute Agent methods
  exposedMethods.forEach((method) =>
    router.post(`/:slug/agent/${method}`, async (req: RequestWithAgent, res: Response) => {
      if (!req.agent) throw Error('Agent not available');

      try {
        const result = await req.agent.execute(method, req.body);

        debug(result);

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

  // 4. /.well-known/did.json
  router.get(`/:slug/${didDocEndpoint}`, async (req: RequestWithAgent, res) => {
    try {
      const serverIdentifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req),
      });
      const didDoc = createDidDocument(serverIdentifier);
      res.status(Status.OK).json(didDoc);
    } catch (e) {
      res.status(Status.NOT_FOUND).send(e);
    }
  });

  router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgent, res) => {
    try {
      const identifier = await req.agent.didManagerGet({
        did: 'did:web:' + getAliasForRequest(req) + ':' + req.params[1].replace('/', ':'),
        // did: 'did:web:' + getAliasForRequest(req) + ':' + req.params[0].replace('/', ':'),
      });
      const didDoc = createDidDocument(identifier);
      res.status(Status.OK).json(didDoc);
    } catch (e) {
      res.status(Status.NOT_FOUND).send(e);
    }
  });

  // 5. messaging router
  router.use(text({ type: '*/*' }));
  router.post('/:slug', async (req: RequestWithAgent, res) => {
    try {
      const message = await req.agent?.handleMessage({
        raw: (req.body as any) as string,
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

  return router;
};

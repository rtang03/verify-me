import { ApiSchemaRouter, MessagingRouter, RequestWithAgentRouter } from '@veramo/remote-server';
import { Router, Request, Response, NextFunction } from 'express';
import Status from 'http-status';
import type { Connection } from 'typeorm';
import type { TenantManager } from '../types';
import type { TTAgent } from '../utils';
import { exposedMethods, WebDidDocRouter } from '../utils';

interface RequestWithAgent extends Request {
  agent: TTAgent;
}

export const createAgentRouter = (commonConnection: Connection, tenantManager: TenantManager) => {
  const router = Router();
  const schemaRouter = ApiSchemaRouter({
    exposedMethods,
    basePath: '/open-api.json',
  });
  const didDocRouter = WebDidDocRouter();
  const messageRouter = MessagingRouter({ metaData: { type: 'DIDComm' } });

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

  router.get('/:slug/is_agent_exist', (req: RequestWithAgent, res) => {
    const agent = req.agent;
    if (agent) res.status(Status.OK).send({ data: 'Agent found' });
    else res.status(Status.OK).send({ data: 'Agent not found' });
  });

  router.post(
    '/:slug/agent/didManagerFind',
    // AgentRouter({ exposedMethods })
    async (req: RequestWithAgent, res: Response, next: NextFunction) => {
      if (!req.agent) throw Error('Agent not available');
      try {
        const result = await req.agent.execute('didManagerFind', req.body);
        res.status(200).json(result);
      } catch (e) {
        if (e.name === 'ValidationError') {
          res.status(400).json({
            name: 'ValidationError',
            message: e.message,
            method: e.method,
            path: e.path,
            code: e.code,
            description: e.description,
          });
        } else {
          res.status(500).json({ error: e.message });
        }
      }
    }
  );

  // api schema
  router.use('/open-api.json', schemaRouter);

  // e.g. /.well-known/did.json
  router.use(didDocRouter);

  router.use(messageRouter);

  return router;
};

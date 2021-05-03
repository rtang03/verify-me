import type { TAgent } from '../utils';
import { createRestController } from '../utils/createRestController';

export const createIdentifierRoute: (agent: TAgent) => any = (agent) =>
  createRestController({
    agent,
    prepareEntityToCreate: (payload) => {
      return payload;
    },
  });

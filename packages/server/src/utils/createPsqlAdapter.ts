import type { Adapter } from 'oidc-provider';

export const createPsqlAdapter: (name: string) => Adapter = (name) => {
  return {
    upsert: async () => {
      return null;
    },
    find: async () => {
      return null;
    },
    findByUserCode: async () => {
      return null;
    },
    findByUid: async () => {
      return null;
    },
    consume: async () => {
      return null;
    },
    destroy: async () => {
      return null;
    },
    revokeByGrantId: async () => {
      return null;
    },
  };
};

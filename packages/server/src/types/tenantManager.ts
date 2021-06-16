import type { Connection } from 'typeorm';
import type { TTAgent } from '../utils';

export type TenantStatus = {
  isActivated: boolean;
  isSchemaExist: boolean;
  isAgentReady: boolean;
};

export type TenantManager = {
  activiate: (tenantId: string) => Promise<boolean>;
  connectAllDatabases: () => Promise<void>;
  deactivate: (tenantId: string) => Promise<boolean>;
  getAgents: () => Record<string, TTAgent>;
  getConnectionPromises: () => Record<string, Promise<Connection>>;
  getTenantStatus: (tenantId: string) => Promise<TenantStatus>;
  getTenantSummary: () => Promise<any>;
  setupAgents: () => Promise<void>;
};

import util from 'util';
import { Entities } from '@veramo/data-store';
import Debug from 'debug';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { setupVeramo, TTAgent } from './setupVeramo';

// In-memory connection objects
let connectionPromises: Record<string, Promise<Connection>>;
let connections: Record<string, Connection>;
const agents: Record<string, TTAgent> = {};
// End of In-memory connection objects

const debug = Debug('utils:connectionManager');

const createConnOption: (tenant: Tenant) => ConnectionOptions = (tenant) => ({
  name: tenant.id,
  type: 'postgres',
  host: tenant.db_host,
  port: tenant.db_port,
  username: tenant.db_username,
  password: tenant.db_password,
  database: tenant.db_name,
  synchronize: false,
  logging: true,
  entities: Entities,
  schema: tenant.id,
});

export const connectAllDatabases: (commonConnection: Connection) => Promise<void> = async (
  commonConnection
) => {
  const connectionPromisesArray = [];
  const connectionArray = [];
  const tenants = await getRepository(Tenant).find({ where: { activated: true } });

  connections = {};

  for await (const tenant of tenants) {
    try {
      await commonConnection.query(
        `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${tenant.id}';`
      );
      const option = createConnOption(tenant);
      const conn = createConnection(option);
      connectionPromisesArray.push({ [option.name]: conn });
      const connection = await conn;
      connectionArray.push({ [option.name]: connection });
    } catch {
      console.warn(`Schema for ${tenant.slug} does not exists`);
    }

    debug(connections);
  }

  connectionPromises = connectionPromisesArray.reduce((prev, curr) => ({ ...prev, ...curr }), {});
  connections = connectionArray.reduce((prev, curr) => ({ ...prev, ...curr }), {});
};

export const getConnectionPromises: () => Record<string, Promise<Connection>> = () =>
  connectionPromises;

export const getConnections: () => Record<string, Connection> = () => connections;

export const getConnectionStatuses: () => Record<string, boolean> = () =>
  Object.entries(connections)
    .map(([tenantId, connection]) => ({ [tenantId]: connection.isConnected }))
    .reduce((prev, curr) => ({ ...prev, ...curr }), {});

export const closeAllConnections: () => Promise<void> = async () => {
  for await (const [tenantId, connection] of Object.entries(connections)) {
    await connection.close();
    console.log(`Connection ${tenantId} is closed`);
  }
};

export const setupAgents: () => void = () =>
  Object.entries(connectionPromises).forEach(
    ([tenantId, promise]) => (agents[tenantId] = setupVeramo(promise))
  );

export const getAgents = () => agents;

export const activiateTenant: (
  tenantId: string,
  commonConnection: Connection
) => Promise<boolean> = async (tenantId, commonConnection) => {
  let tenant: Tenant;
  let tenantRepo: Repository<Tenant>;
  let isTenantExist: boolean;
  let isTenantUpdated: boolean;
  let isSchemaExist: boolean;
  let isConnectionReady: boolean;
  let isAgentReady: boolean;

  // Step 0: retrieve tenant
  try {
    tenantRepo = getConnection('default').getRepository(Tenant);
    tenant = await tenantRepo.findOne({ where: { id: tenantId } });
    isTenantExist = true;
  } catch (error) {
    console.error(util.format('fail to retrieve tentant, %j', error));
  }

  if (!tenant) throw new Error('tenant not found');

  // step 1: check schema
  console.log('Create schema if not exist,... ');

  try {
    const result = await commonConnection.query(`CREATE SCHEMA IF NOT EXISTS ${tenant.id}`);
    console.log(result);
    isSchemaExist = true;
  } catch (error) {
    console.warn(util.format('fail to create schema %s:, %j', tenant.id, error));
  }

  // step 2: add connectionPromise
  const connectionOption = createConnOption(tenant);
  const { name } = connectionOption; // this is tenantId

  if (connectionPromises[name]) console.warn('connectionPromise already exists');
  const promise = createConnection(connectionOption);
  connectionPromises[name] = promise;

  // step 3: add connection
  if (connections[name]) console.warn('connection already exists');
  let connection: Connection;
  try {
    connection = await promise;
    isConnectionReady = true;
  } catch (error) {
    console.warn(util.format('fail to create connection %s, %j', tenant.id, error));
  }
  connections[name] = connection;

  // step 4: add agent
  try {
    agents[name] = setupVeramo(promise);
    isAgentReady = true;
  } catch (error) {
    console.warn(util.format('fail to setup Agent %s, %j', tenant.id, error));
  }

  // step 5: update Tenant
  try {
    const result = await tenantRepo.update(tenant.id, { activated: true });
    result?.affected === 1 && (isTenantUpdated = true);
  } catch (error) {
    console.warn(util.format('fail to update Tenant %s, %j', tenant.id, error));
  }

  return isAgentReady && isConnectionReady && isTenantExist && isSchemaExist && isTenantUpdated;
};

export const deactivateTenant: (tenantId: string) => Promise<boolean> = async (tenantId) => {
  // remove connectionPromise
  delete connectionPromises[tenantId];

  // remove connection
  try {
    await connections[tenantId].close();
  } catch (error) {
    console.warn(error);
  }
  delete connections[tenantId];

  // remove agent
  delete agents[tenantId];

  try {
    const tenantRepo = getConnection('default').getRepository(Tenant);
    const result = await tenantRepo.update(tenantId, { activated: false });
    return result?.affected === 1;
  } catch (error) {
    console.warn(util.format('fail to update Tenant %s, %j', tenantId, error));
  }

  return false;
};

/**
 * check if the connection manager has valid connection, and schema exist
 * @param tenantId
 * @param commonConnection
 */
export const isTenantActive: (
  tenantId: string,
  commonConnection: Connection
) => Promise<boolean> = async (tenantId, commonConnection) => {
  try {
    await commonConnection.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${tenantId}';`
    );
    return !!connectionPromises[tenantId] && !!connections[tenantId] && !!agents[tenantId];
  } catch {
    return false;
  }
};

import { Entities } from '@veramo/data-store';
import Debug from 'debug';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  getRepository,
} from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { setupVeramo, TTAgent } from './setupVeramo';

// In-memory connection objects
let connectionPromises: Record<string, Promise<Connection>>;
let connections: Record<string, Connection>;
let agents: Record<string, TTAgent>;
// End of In-memory connection objects

const debug = Debug('utils:connectionManager');

const createConnOption: (tenant: Tenant) => ConnectionOptions = (tenant) => ({
  name: tenant.slug,
  type: 'postgres',
  host: tenant.db_host,
  port: tenant.db_port,
  username: tenant.db_username,
  password: tenant.db_password,
  database: tenant.db_name,
  synchronize: false,
  logging: true,
  entities: Entities,
  schema: tenant.slug,
});

export const connectAllDatabases: (commonConnection: Connection) => Promise<void> = async (
  commonConnection
) => {
  connections = {};
  const tenants = await getRepository(Tenant).find();

  debug(tenants);

  for await (const tenant of tenants) {
    const result = await commonConnection?.query(`CREATE SCHEMA IF NOT EXISTS ${tenant.slug}`);
    console.log('Connect all database / create schema if not exist: ', result);
  }

  connectionPromises = tenants
    .map((tenant) => createConnOption(tenant))
    .map((connectionOption) => ({ [connectionOption.name]: createConnection(connectionOption) }))
    .reduce((prev, curr) => ({ ...prev, ...curr }), {});

  for await (const [name, conn] of Object.entries(connectionPromises)) {
    const connection = await conn;
    console.log(`Schema ${connection.name} is connected`);
    connections[name] = connection;
  }
};

export const getConnectionPromises: () => Record<string, Promise<Connection>> = () =>
  connectionPromises;

export const getConnections: () => Record<string, Connection> = () => connections;

export const getConnectionStatuses: () => Record<string, boolean> = () => {
  const statuses = {};
  for (const [name, connection] of Object.entries(connections)) {
    statuses[name] = connection.isConnected;
  }
  return statuses;
};

export const closeAllConnections: () => Promise<void> = async () => {
  for await (const [name, connection] of Object.entries(connections)) {
    await connection.close();
    console.log(`Connection ${name} is closed`);
  }
};

export const setupAgents: () => void = () => {
  agents = {};
  for (const [name, promise] of Object.entries(connectionPromises)) {
    agents[name] = setupVeramo(promise);
  }
};

export const getAgents = () => agents;

export const activiateTenant: (
  slug: string,
  commonConnection: Connection
) => Promise<void> = async (slug, commonConnection) => {
  let promise;

  // Step 0: retrieve tenant
  const tenantRepo = getConnection('default').getRepository(Tenant);
  const tenant = await tenantRepo.findOne({ where: { slug } });

  if (!tenant) throw new Error('tenant not found');

  // step 1: check schema
  console.log('Create schema if not exist,... ');
  const result = await commonConnection.query(`CREATE SCHEMA IF NOT EXISTS ${tenant.slug}`);
  console.log(result);

  // step 2: add connectionPromise
  const connectionOption = createConnOption(tenant);
  const { name } = connectionOption;

  if (connectionPromises[name]) throw new Error('connectionPromise already exists');
  else {
    promise = createConnection(connectionOption);
    connectionPromises[name] = promise;
  }

  // step 3: add connection
  if (connections[name]) throw new Error('connection already exists');
  else {
    const connection = await promise;
    console.log(`Schema ${name} is connected`);
    connections[name] = connection;
  }

  // step 4: add agent
  agents[name] = setupVeramo(promise);
};

export const deactivateTenant: (name: string) => Promise<void> = async (name) => {
  // remove connectionPromise
  delete connectionPromises[name];

  // remove connection
  await connections[name].close();
  delete connections[name];

  // remove agent
  delete agents[name];
};

export const isTenantActive: (name: string) => boolean = (name) =>
  !!connectionPromises[name] && !!connections[name] && !!agents[name];

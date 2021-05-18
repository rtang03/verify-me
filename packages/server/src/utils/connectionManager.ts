import { Connection, ConnectionOptions, createConnections, getRepository } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { Users } from '../entities/Users';

// in-memory connection pool
let connectionMap: Record<string, Connection>;

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
  entities: [Users],
  schema: tenant.slug,
});

export const connectAllDatabases = async () => {
  let tenants: Tenant[];

  try {
    tenants = await getRepository(Tenant).find();
  } catch (e) {
    console.error(e);
  }

  const connectionOptionss = tenants.map((tenant) => createConnOption(tenant));
  const connections = await createConnections(connectionOptionss);

  connectionMap = connections
    .map((conn) => ({ [conn.name]: conn }))
    .reduce((prev, curr) => ({ ...prev, ...curr }), {});
};

export const getConnectionMap = () => connectionMap;

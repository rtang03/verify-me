require('dotenv').config({ path: './.env.test' });
import { Entities } from '@veramo/data-store';
import { ConnectionOptions, createConnection } from 'typeorm';
import { isIdentitifer, setupVeramo } from '../utils';

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'docker',
  database: 'auth_db',
  synchronize: true,
  logging: true,
  entities: Entities,
};
const agent = setupVeramo(createConnection(connectionOptions));
const web = `example${Math.floor(Math.random() * 10000)}.com`;

afterAll(
  async () => new Promise<void>((ok) => setTimeout(() => ok(), 2000))
);

describe('veramo unit test', () => {
  it('should create identity', async () => {
    const identifier = await agent.didManagerGetOrCreate({ alias: web });
    expect(isIdentitifer(identifier)).toBeTruthy();
  });

  it('should add', async () => {
    const result = await agent.didManagerAddService({
      did: `did:web:${web}`,
      service: {
        id: `did:web${web}#linked-domain`,
        serviceEndpoint: 'https://bar.example.com',
        type: 'LinkedDomains',
      },
    });
    expect(result).toEqual({ success: true });
  });

  it('should get identity', async () => {
    const identifier = await agent.didManagerGetByAlias({ alias: web, provider: 'did:web' });
    expect(isIdentitifer(identifier)).toBeTruthy();
  });

  it('should delete identity', async () => {
    const result = await agent.didManagerDelete({ did: `did:web:${web}` });
    expect(result).toBeTruthy();
  });
});

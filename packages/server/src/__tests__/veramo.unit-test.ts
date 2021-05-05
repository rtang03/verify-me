require('dotenv').config({ path: './.env.test' });
import { Entities } from '@veramo/data-store';
import { ConnectionOptions, createConnection } from 'typeorm';
import { isIdentitifer, setupVeramo, TTAgent } from '../utils';

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
const agent: TTAgent = setupVeramo(createConnection(connectionOptions));
const web = `example${Math.floor(Math.random() * 10000)}.com`;

afterAll(
  async () => new Promise<void>((ok) => setTimeout(() => ok(), 2000))
);

describe('Identitier unit test', () => {
  it('should create identity', async () => {
    const identifier = await agent.didManagerGetOrCreate({ alias: web });
    expect(isIdentitifer(identifier)).toBeTruthy();
  });

  it('should add', async () => {
    const result = await agent.didManagerAddService({
      did: `did:web:${web}`,
      service: {
        id: `did:web:${web}#linked-domain`,
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

// const vc = {
//   credentialSubject: { tutorial: 42, status: 'completed', id: 'did:web:alice' },
//   issuer: { id: 'did:web:example.com' },
//   type: ['VerifiableCredential'],
//   '@context': ['https://www.w3.org/2018/credentials/v1'],
//   issuanceDate: '2021-05-03T03:45:19.000Z',
//   proof: {
//     type: 'JwtProof2020',
//     jwt:
//       'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJ0dXRvcmlhbCI6NDIsInN0YXR1cyI6ImNvbXBsZXRlZCJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl19LCJzdWIiOiJkaWQ6d2ViOmFsaWNlIiwibmJmIjoxNjIwMDEzNTE5LCJpc3MiOiJkaWQ6d2ViOmV4YW1wbGUuY29tIn0.xbl_OWc3vcGoz9mN36gF2JwwuZeiHeWgld-9X0FErawpaIrCwuQyhREmf64eC81nWkBfnh9ypK2F4e3B84y--g',
//   },
// };
describe('Credential unit test', () => {
  it('should create credential', async () => {
    const user = await agent.didManagerGetOrCreate({ alias: 'alice' });
    const credential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: 'did:web:example.com' },
        credentialSubject: {
          id: user.did,
          tutorial: 42,
          status: 'completed',
        },
      },
      proofFormat: 'jwt',
      save: true,
    });
    console.log(credential);
  });
});

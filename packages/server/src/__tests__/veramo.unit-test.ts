require('dotenv').config({ path: './.env.test' });
import { Entities } from '@veramo/data-store';
import { blake2bHex } from 'blakejs';
import omit from 'lodash/omit';
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

// describe('Identitier unit test', () => {
//   it('should create identity', async () => {
//     const identifier = await agent.didManagerGetOrCreate({ alias: web });
//     expect(isIdentitifer(identifier)).toBeTruthy();
//   });
//
//   it('should add', async () => {
//     const result = await agent.didManagerAddService({
//       did: `did:web:${web}`,
//       service: {
//         id: `did:web:${web}#linked-domain`,
//         serviceEndpoint: 'https://bar.example.com',
//         type: 'LinkedDomains',
//       },
//     });
//     expect(result).toEqual({ success: true });
//   });
//
//   it('should get identity', async () => {
//     const identifier = await agent.didManagerGetByAlias({ alias: web, provider: 'did:web' });
//     expect(isIdentitifer(identifier)).toBeTruthy();
//   });
//
//   it('should delete identity', async () => {
//     const result = await agent.didManagerDelete({ did: `did:web:${web}` });
//     expect(result).toBeTruthy();
//   });
// });

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
    const user = await agent.didManagerGetOrCreate({ alias: 'example.com:users:alice' });
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
    const credentialHash = blake2bHex(JSON.stringify(credential));
    console.log(credentialHash);
    const claims = omit(credential.credentialSubject, 'id');
    Object.entries(claims).forEach(([key]) => {
      const claimHash = blake2bHex(JSON.stringify(credential) + key);
      console.log(claimHash);
    });
  });
});

// http://9b97989fb059.ngrok.io/agent/sendMessageDIDCommAlpha1
// {
//   "data": {
//     "from": "did:web:9b97989fb059.ngrok.io",
//     "to": "did:web:9b97989fb059.ngrok.io:users:apple",
//     "type": "jwt",
//     "body": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJraW5kIjoiZnJ1aXQifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2ZpbGUiXX0sInN1YiI6ImRpZDp3ZWI6OWI5Nzk4OWZiMDU5Lm5ncm9rLmlvOnVzZXJzOmFwcGxlIiwibmJmIjoxNjIwNjUyOTQ5LCJpc3MiOiJkaWQ6d2ViOjliOTc5ODlmYjA1OS5uZ3Jvay5pbyJ9.qHkkTLMM9xcu-y1lduKLGFl8JXq6Ufq68JbwX2FcbBE1V2GM3u1XeVu8AW7WW66KxkMxjiTzQtTzrmmFAPqutA"
// },
//   "save": true,
//   "url": "https://9b97989fb059.ngrok.io"
// }
// const sendVC = {
//   raw:
//     'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJraW5kIjoiZnJ1aXQifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2ZpbGUiXX0sInN1YiI6ImRpZDp3ZWI6OWI5Nzk4OWZiMDU5Lm5ncm9rLmlvOnVzZXJzOmFwcGxlIiwibmJmIjoxNjIwNjUyOTQ5LCJpc3MiOiJkaWQ6d2ViOjliOTc5ODlmYjA1OS5uZ3Jvay5pbyJ9.qHkkTLMM9xcu-y1lduKLGFl8JXq6Ufq68JbwX2FcbBE1V2GM3u1XeVu8AW7WW66KxkMxjiTzQtTzrmmFAPqutA',
//   metaData: [
//     {
//       type: 'DIDComm-sent',
//     },
//     {
//       type: 'DIDComm',
//     },
//     {
//       type: 'JWT',
//       value: 'ES256K',
//     },
//   ],
//   id:
//     '3d2790c2b76c73154ede3b314417ba7b8ca3aa6fb4afbb54c66cc95623caa6982e6d59c6566f8414723a6add5b5078d3222755ed98cfe16012acf60f8fee72c7',
//   data: {
//     vc: {
//       credentialSubject: {
//         kind: 'fruit',
//       },
//       '@context': ['https://www.w3.org/2018/credentials/v1'],
//       type: ['VerifiableCredential', 'Profile'],
//     },
//     sub: 'did:web:9b97989fb059.ngrok.io:users:apple',
//     nbf: 1620652949,
//     iss: 'did:web:9b97989fb059.ngrok.io',
//   },
//   type: 'w3c.vc',
//   from: 'did:web:9b97989fb059.ngrok.io',
//   to: 'did:web:9b97989fb059.ngrok.io:users:apple',
//   createdAt: '2021-05-10T13:22:29.000Z',
//   credentials: [
//     {
//       credentialSubject: {
//         kind: 'fruit',
//         id: 'did:web:9b97989fb059.ngrok.io:users:apple',
//       },
//       issuer: {
//         id: 'did:web:9b97989fb059.ngrok.io',
//       },
//       type: ['VerifiableCredential', 'Profile'],
//       '@context': ['https://www.w3.org/2018/credentials/v1'],
//       issuanceDate: '2021-05-10T13:22:29.000Z',
//       proof: {
//         type: 'JwtProof2020',
//         jwt:
//           'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJraW5kIjoiZnJ1aXQifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2ZpbGUiXX0sInN1YiI6ImRpZDp3ZWI6OWI5Nzk4OWZiMDU5Lm5ncm9rLmlvOnVzZXJzOmFwcGxlIiwibmJmIjoxNjIwNjUyOTQ5LCJpc3MiOiJkaWQ6d2ViOjliOTc5ODlmYjA1OS5uZ3Jvay5pbyJ9.qHkkTLMM9xcu-y1lduKLGFl8JXq6Ufq68JbwX2FcbBE1V2GM3u1XeVu8AW7WW66KxkMxjiTzQtTzrmmFAPqutA',
//       },
//     },
//   ],
// };

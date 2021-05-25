// import { Entities } from '@veramo/data-store';
// import { Express } from 'express';
// import request from 'supertest';
// import type { ConnectionOptions } from 'typeorm';
// import { createHttpServer, isCredential } from '../utils';
//
// const connectionOptions: ConnectionOptions = {
//   name: 'default',
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'docker',
//   database: 'auth_db',
//   synchronize: true,
//   logging: true,
//   entities: Entities,
// };
//
// let app: Express;
// let hash: string;
//
// beforeAll(async () => {
//   try {
//     app = await createHttpServer({ connectionOptions });
//
//     if (!app) {
//       console.error('🚫  app is undefined');
//       process.exit(1);
//     }
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   }
// });
//
// afterAll(
//   async () => new Promise<void>((ok) => setTimeout(() => ok(), 2000))
// );
//
// describe('unit test', () => {
//   it('should create Issuer', async () =>
//     request(app)
//       .post('/agent/didManagerGetOrCreate')
//       .set('authorization', `Bearer`)
//       .send({ alias: 'example.com' }));
//
//   it('should create Subject', async () =>
//     request(app)
//       .post('/agent/didManagerGetOrCreate')
//       .set('authorization', `Bearer`)
//       .send({ alias: 'example.com:users:alice' }));
//
//   it('should create Credential', async () =>
//     request(app)
//       .post('/agent/createVerifiableCredential')
//       .set('authorization', `Bearer`)
//       .send({
//         credential: {
//           issuer: { id: 'did:web:example.com' },
//           credentialSubject: { id: 'did:web:example.com:users:alice', gender: 'F' },
//         },
//         proofFormat: 'jwt',
//         save: true,
//       })
//       .expect(({ body }) => {
//         console.log(body);
//       }));
//
//   it('should GET /issuers/did:web:example.com/credentials', async () =>
//     request(app)
//       .get(`/issuers/did:web:example.com/credentials`)
//       .set('authorization', `Bearer`)
//       .expect(({ body }) => {
//         expect(body.status).toBe('OK');
//         body.data.items.forEach((item) => {
//           hash = item.hash;
//           expect(hash).toBeDefined();
//           expect(isCredential(item.body)).toBeTruthy();
//           expect(item.body.issuer.id).toEqual('did:web:example.com');
//         });
//       }));
//
//   it('should GET /issuers/credentials/:hash', async () =>
//     request(app)
//       .get(`/issuers/credentials/${hash}`)
//       .set('authorization', `Bearer`)
//       .expect(({ body }) => {
//         expect(body.status).toBe('OK');
//         expect(isCredential(body.data.body)).toBeTruthy();
//       }));
// });

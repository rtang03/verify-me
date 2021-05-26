// import type { IIdentifier } from '@veramo/core';
// import { Entities } from '@veramo/data-store';
// import { Express } from 'express';
// import Status from 'http-status';
// import request from 'supertest';
// import type { ConnectionOptions } from 'typeorm';
// import { CommonResponse, Paginated } from '../types';
// import { createHttpServer, isIdentitifer } from '../utils';
//
// const connectionOptions: ConnectionOptions = {
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
// const web = `tester${Math.floor(Math.random() * 10000)}.com`;
//
// let app: Express;
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
//   it('should POST /identifiers', async () =>
//     request(app)
//       .post('/identifiers')
//       .set('authorization', `Bearer`)
//       .send({ alias: web, method: 'web' })
//       .expect(({ body, status }) => {
//         expect(status).toBe(Status.CREATED);
//         expect(body.status).toBe('OK');
//         expect(isIdentitifer(body?.data)).toBeTruthy();
//       }));
//
//   it('should fail to GET /identifiers/:id', async () =>
//     request(app)
//       .get(`/identifiers/did:web:xyz.com`)
//       .set('authorization', `Bearer`)
//       .expect(({ body, status }) => {
//         expect(status).toBe(Status.BAD_REQUEST);
//         expect(body.status).toEqual('ERROR');
//       }));
//
//   it('should GET /identifiers/:id', async () =>
//     request(app)
//       .get(`/identifiers/did:web:${web}`)
//       .set('authorization', `Bearer`)
//       .expect(({ body }) => {
//         expect(body.status).toBe('OK');
//         expect(isIdentitifer(body?.data)).toBeTruthy();
//       }));
//
//   it('should GET /identifiers', async () =>
//     request(app)
//       .get('/identifiers')
//       .set('authorization', `Bearer`)
//       .expect(({ body }: { body: CommonResponse<Paginated<IIdentifier>> }) => {
//         body.data.items.forEach((identifier) => expect(isIdentitifer(identifier)).toBeTruthy());
//       }));
//
//   it('should fail to DELETE /identifiers, without identifier', async () =>
//     request(app)
//       .delete('/identifiers')
//       .set('authorization', `Bearer`)
//       .expect(({ status }) => {
//         expect(status).toBe(Status.METHOD_NOT_ALLOWED);
//       }));
//
//   it('should fail to DELETE /identifiers/:id', async () =>
//     request(app)
//       .delete(`/identifiers/did:web:${web}`)
//       .set('authorization', `Bearer`)
//       .expect(({ body }) => expect(body).toEqual({ status: 'OK', data: true })));
// });

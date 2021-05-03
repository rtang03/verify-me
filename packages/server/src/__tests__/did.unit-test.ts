require('dotenv').config({ path: './.env.test' });
import { Express } from 'express';
import request from 'supertest';
import type { ConnectionOptions } from 'typeorm';
import { DidDocument } from '../entities/DidDocument';
import type { CommonResponse, Paginated } from '../types';
import { createHttpServer, createKeyPair, isDidDocument, isDidDocumentArray } from '../utils';

let app: Express;

const connectionOptions: ConnectionOptions = {
  type: 'mongodb',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT, 10),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  logging: true,
  entities: [DidDocument],
  useUnifiedTopology: true,
};
const { did, publicKey } = createKeyPair();

beforeAll(async () => {
  try {
    app = await createHttpServer({ connectionOptions });

    if (!app) {
      console.error('🚫  app is undefined');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

afterAll(
  async () => new Promise<void>((ok) => setTimeout(() => ok(), 2000))
);

describe('unit test', () => {
  it('should GET /', async () =>
    request(app)
      .get('/')
      .expect(({ body }) => expect(body).toEqual({ data: 'hello' })));

  it('should POST /dids', async () =>
    request(app)
      .post('/dids')
      .set('authorization', `Bearer`)
      .send({ id: did, description: 'first diddocument', controllerKey: publicKey })
      .expect(({ body }: { body: CommonResponse<unknown> }) => {
        expect(body.status).toBe('OK');
        expect(isDidDocument(body.data)).toBeTruthy();
      }));

  it('should fail to GET /dids/:id', async () =>
    request(app)
      .get(`/dids/1234567`)
      .expect(({ body }: { body: CommonResponse<unknown> }) =>
        expect(body?.status).toEqual('NOT_FOUND')
      ));

  it('should GET one /dids/:id', async () =>
    request(app)
      .get(`/dids/${did}`)
      .expect(({ body }: { body: CommonResponse<unknown> }) => {
        expect(body.status).toBe('OK');
        if (isDidDocument(body?.data)) {
          expect(body.data.id).toEqual(did);
        } else return Promise.reject('fail the test');
      }));

  it('should GET /dids, with pagination', async () =>
    request(app)
      .get('/dids?cursor=0&pagesize=2')
      .expect(({ body }: { body: CommonResponse<Paginated<DidDocument>> }) => {
        expect(body.status).toBe('OK');
        expect(isDidDocumentArray(body?.data?.items)).toBeTruthy();
      }));

  it('should DELETE /dids/:id', async () =>
    request(app)
      .delete(`/dids/${did}`)
      .expect(({ body }) => {
        expect(body.status).toBe('OK');
        expect(body.data).toEqual({ n: 1, ok: 1 });
      }));
});

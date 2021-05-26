import { Credential } from '@veramo/data-store';
import { Router } from 'express';
import Status from 'http-status';
import { Repository } from 'typeorm';
import type { CommonResponse, Paginated } from '../types';

export const createIssuerRoute: (repo: Repository<Credential>) => Router = (repo) => {
  const router = Router();

  router.get('/credentials/:hash', async (req, res) => {
    const item = await repo.findOne({ where: { hash: req.params.hash } });
    const response: CommonResponse<{ hash: string; body: any }> = {
      status: 'OK',
      data: { hash: item.hash, body: item.raw },
    };
    res.status(Status.OK).send(response);
  });

  // Repository<Credential> will return
  // const credential = {
  //   hash:
  //     '2973e942a57e6f8a12ebaa11d09b3f175eecf6d59fc49255bb5a63ed75ed40f9bb7c070038c2461c95d6e94a6481e38a26f60c938904c8f9e0b50356c7373c94',
  //   _raw: {
  //     credentialSubject: { tutorial: 42, status: 'completed', id: 'did:web:alice' },
  //     issuer: { id: 'did:web:example.com' },
  //     type: ['VerifiableCredential'],
  //     '@context': ['https://www.w3.org/2018/credentials/v1'],
  //     issuanceDate: '2021-05-07T13:11:47.000Z',
  //     proof: {
  //       type: 'JwtProof2020',
  //       jwt:
  //         'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJ0dXRvcmlhbCI6NDIsInN0YXR1cyI6ImNvbXBsZXRlZCJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl19LCJzdWIiOiJkaWQ6d2ViOmFsaWNlIiwibmJmIjoxNjIwMzkzMTA3LCJpc3MiOiJkaWQ6d2ViOmV4YW1wbGUuY29tIn0.avy0QBF94ieML8GC0MZB4mIi4alYm5s0bGc6g4HtFKxUNluqFdmddEGRff9pzlPZfx76IniPS8quHwVeXEY18w',
  //     },
  //   },
  //   id: null,
  //   issuanceDate: '2021-05-07T13:11:47.000Z',
  //   expirationDate: null,
  //   context: ['https://www.w3.org/2018/credentials/v1'],
  //   type: ['VerifiableCredential'],
  //   issuer: {
  //     did: 'did:web:example.com',
  //     provider: 'did:web',
  //     alias: 'example.com',
  //     controllerKeyId:
  //       '04f22c88efa04acde3307c558074bb264e7ccc04b7e585b1e2b61bb02b75db3b387bbf100eb490aa7753f6c023a863e5f830de8d1cafbde4ebe0c7a41c150ad3c9',
  //   },
  //   subject: {
  //     did: 'did:web:alice',
  //     provider: 'did:web',
  //     alias: 'alice',
  //     controllerKeyId:
  //       '04abbd9d6ad30a71c453c48f8a3fb3edf57a98ecf6b87fc19d4690810883d6a7a18b319aacd9bd28a9d6ce7618cf46206e0d0250d7283101e556e1639a81b3fa60',
  //   },
  // };
  router.get('/:issuer/credentials', async (req, res) => {
    const skip = parseInt(req.query?.skip as string, 10) ?? 0;
    const take = parseInt(req.query?.take as string, 10) ?? 10;
    const [items, total] = await repo.findAndCount({
      order: { issuanceDate: 'DESC' },
      where: { issuer: { did: req.params.issuer } },
      skip,
      take,
    });
    const hasMore = skip + take < total;
    const cursor = hasMore ? skip + take : total;
    const response: CommonResponse<Paginated<{ hash: string; body: any }>> = {
      status: 'OK',
      data: {
        total,
        cursor,
        hasMore,
        items: items.map((item) => ({ hash: item.hash, body: item.raw })),
      },
    };
    res.status(Status.OK).send(response);
  });

  return router;
};

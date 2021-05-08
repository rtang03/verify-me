import { Identifier } from '@veramo/data-store';
import { Router } from 'express';
import Status from 'http-status';
import { Repository } from 'typeorm';
import type { CommonResponse, Paginated } from '../types';

export const createIdentifierRoute: (repo: Repository<Identifier>) => Router = (repo) => {
  const router = Router();

  router.get('/:issuer/users', async (req, res) => {
    const skip = parseInt(req.query?.skip as string, 10) ?? 0;
    const take = parseInt(req.query?.take as string, 10) ?? 10;
    const [items, total] = await repo.findAndCount({
      order: { did: 'ASC' },
      skip,
      take,
    });
    const hasMore = skip + take < total;
    const cursor = hasMore ? skip + take : total;
    const response: CommonResponse<Paginated<any>> = {
      status: 'OK',
      data: {
        total,
        cursor,
        hasMore,
        items,
      },
    };
    res.status(Status.OK).send(response);
  });

  return router;
};

import Status from 'http-status';
import { Repository } from 'typeorm';
import { Accounts } from '../entities/Accounts';
import { CommonResponse, Paginated } from '../types';
import { createRestRoute } from '../utils';

export const createAccountRoute = (repo: Repository<Accounts>) =>
  createRestRoute({
    GET: async (req, res) => {
      const items = await repo.findByIds([req.params.id]);
      const data = {
        total: 1,
        cursor: 1,
        hasMore: false,
        items,
      };
      if (data) res.status(Status.OK).send({ status: 'OK', data });
      else res.status(Status.NOT_FOUND).send({ status: 'NOT_FOUND' });
    },
    GET_ALL: async (req, res, skip, take) => {
      const user_id = req?.query?.user_id;
      const where = user_id && { where: { user_id } };
      const [items, total] = await repo.findAndCount({ skip, take, ...where });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const response: CommonResponse<Paginated<Accounts>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
      res.status(Status.OK).send(response);
    },
    POST: async (req, res) => {
      console.warn('should be handled via Next-Auth');
      res.status(Status.FORBIDDEN).send({ status: 'ERROR', error: 'This method is not supported' });
    },
    DELETE: async (req, res) => {
      // TODO: should later implement DELETE method
      console.warn('should be handled via Next-Auth');
      res.status(Status.FORBIDDEN).send({ status: 'ERROR', error: 'This method is not supported' });
    },
    PUT: async (req, res) => {
      console.warn('should be handled via Next-Auth');
      res.status(Status.FORBIDDEN).send({ status: 'ERROR', error: 'This method is not supported' });
    },
  });

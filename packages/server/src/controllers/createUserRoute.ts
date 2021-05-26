import Status from 'http-status';
import intersection from 'lodash/intersection';
import { Repository } from 'typeorm';
import { Users } from '../entities/Users';
import { CommonResponse, Paginated } from '../types';
import { createRestRoute } from '../utils';

export const createUserRoute = (userRepo: Repository<Users>) =>
  createRestRoute({
    GET: async (req, res) => {
      const items = await userRepo.findByIds([req.params.id]);
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
      // query with email
      const email = req?.query?.email;
      const where = email && { where: { email } };
      const [items, total] = await userRepo.findAndCount({ skip, take, ...where });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const response: CommonResponse<Paginated<Users>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
      res.status(Status.OK).send(response);
    },
    POST: async (req, res) => {
      console.warn('Users ahould be created via Next-Auth');
      res.status(Status.FORBIDDEN).send({ status: 'ERROR', error: 'This method is not supported' });
    },
    DELETE: async (req, res) => {
      // TODO: should later implement DELETE method
      console.warn('User cannot be deleted, after created');
      res.status(Status.FORBIDDEN).send({ status: 'ERROR', error: 'This method is not supported' });
    },
    PUT: async (req, res) => {
      const body = req.body;
      const fields = ['name', 'email', 'active_tenant'];

      if (intersection(Object.keys(body), fields).length === 0)
        return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });

      const data = await userRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

import Status from 'http-status';
import intersection from 'lodash/intersection';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { Users } from '../entities/Users';
import type { CommonResponse, CreateTenantArgs, Paginated } from '../types';
import { createRestRoute } from '../utils';

export const createTenantRoute = (
  tenantRepo: Repository<Tenant>,
  userRepo: Repository<Users>,
  envVariables?: any
) =>
  createRestRoute({
    GET: async (req, res) => {
      const items = await tenantRepo.findByIds([req.params.id]);
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
      // query with user_id
      const user_id = req?.query?.user_id;
      // query with email_id and name
      const email = req?.query?.email;

      // search with either user_id OR email
      let where: any;

      if (user_id) {
        where = { where: { user_id } };
      } else if (email) {
        const user = await userRepo.findOne({ where: { email } });
        where = { where: { user_id: user.id } };
      }

      const [items, total] = await tenantRepo.findAndCount({ skip, take, ...where });
      const hasMore = skip + take < total;
      const cursor = hasMore ? skip + take : total;
      const response: CommonResponse<Paginated<Tenant>> = {
        status: 'OK',
        data: { total, cursor, hasMore, items },
      };
      res.status(Status.OK).send(response);
    },
    POST: async (req, res) => {
      const body: CreateTenantArgs = req.body;

      if (!body?.slug)
        return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing slug' });

      if (!body?.user_id)
        return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'missing user_id' });

      const isExisted = await tenantRepo.findOne({ where: { slug: body.slug } });

      if (isExisted)
        return res
          .status(Status.BAD_REQUEST)
          .send({ status: 'ERROR', error: 'slug already exists' });

      const tenant = new Tenant();

      tenant.slug = body.slug;
      tenant.user_id = body.user_id;

      // using .env
      tenant.db_name = body?.db_name || envVariables.DB_NAME;
      tenant.db_host = body?.db_host || envVariables.DB_HOST;
      const port: number = body?.db_port && parseInt(body.db_port, 10);
      tenant.db_port = port || envVariables.DB_PORT;
      tenant.db_username = body?.db_username || envVariables.DB_USERNAME;
      tenant.db_password = body?.db_username || envVariables.DB_PASSWORD;

      const data = await tenantRepo.save(tenant);

      res.status(Status.CREATED).send({ status: 'OK', data });
    },
    DELETE: async (req, res) => {
      const data = await tenantRepo.delete(req.params.id);
      res.status(Status.OK).send({ status: 'OK', data });
    },
    PUT: async (req, res) => {
      const body = req.body;
      const fields = [
        'slug',
        // Don't expect to change user_id, after initially created
        // 'user_id',
        'name',
        'db_name',
        'db_host',
        'db_username',
        'db_password',
        'db_port',
      ];

      if (intersection(Object.keys(body), fields).length === 0)
        return res.status(Status.BAD_REQUEST).send({ status: 'ERROR', error: 'invalid argument' });

      const data = await tenantRepo.update(req.params.id, body);
      res.status(Status.OK).send({ status: 'OK', data });
    },
  });

import Debug from 'debug';
import knex from 'knex';

const debug = Debug('utils:createOidcRoute');
const tableName = 'oidc_payloads';
const types = [
  'Session',
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'ClientCredentials',
  'Client',
  'InitialAccessToken',
  'RegistrationAccessToken',
  'Interaction',
  'ReplayDetection',
  'PushedAuthorizationRequest',
  'Grant',
].reduce((map, name, i) => ({ ...map, [name]: i + 1 }), {});

const knexAdapter = (client) => {
  let _client;

  const getClient = () => {
    if (typeof _client === 'undefined')
      _client = typeof client === 'function' ? client : knex(client);
    return _client;
  };

  const getExpireAt = (expiresIn) => {
    return expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;
  };

  return class DbAdapter {
    name: string;
    type: any;
    knexAdapter: any;

    constructor(name) {
      this.name = name;
      this.type = types[name];
    }

    async testConnection() {
      try {
        await getClient().table(tableName);
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    }

    async upsert(id, payload, expiresIn) {
      debug('id: %s', id);
      debug('payload: %O', payload);

      const expiresAt = getExpireAt(expiresIn);

      try {
        await getClient()
          .table(tableName)
          .insert({
            id,
            type: this.type,
            payload: JSON.stringify(payload),
            grantId: payload.grantId,
            userCode: payload.userCode,
            uid: payload.uid,
            expiresAt,
          })
          .onConflict(['id', 'type'])
          .merge();
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    }

    get _table() {
      return getClient().table(tableName).where('type', this.type);
    }

    _rows(obj) {
      return this._table.where(obj);
    }

    // eslint-disable-next-line class-methods-use-this
    _result(r) {
      return r.length > 0
        ? {
            ...JSON.parse(r[0].payload),
            ...(r[0].consumedAt ? { consumed: true } : undefined),
          }
        : undefined;
    }

    _findBy(obj) {
      return this._rows(obj).then(this._result);
    }

    find(id) {
      return this._findBy({ id });
    }

    findByUserCode(userCode) {
      return this._findBy({ userCode });
    }

    findByUid(uid) {
      return this._findBy({ uid });
    }

    destroy(id) {
      return this._rows({ id }).delete();
    }

    revokeByGrantId(grantId) {
      return this._rows({ grantId }).delete();
    }

    consume(id) {
      return this._rows({ id }).update({ consumedAt: new Date() });
    }
  };
};

const ENV_VAR = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 3002,
  SPORT: parseInt(process.env.SPORT, 10) || 3002,
  DB_HOST: process.env.TYPEORM_HOST,
  DB_PORT: parseInt(process.env.TYPEORM_PORT, 10),
  DB_USERNAME: process.env.TYPEORM_USERNAME,
  DB_PASSWORD: process.env.TYPEORM_PASSWORD,
  DB_NAME: process.env.TYPEORM_DATABASE,
};

const defaultConfig = {
  client: 'pg',
  connection: {
    host: ENV_VAR.DB_HOST,
    port: ENV_VAR.DB_PORT,
    user: ENV_VAR.DB_USERNAME,
    password: ENV_VAR.DB_PASSWORD,
    database: ENV_VAR.DB_NAME,
  },
  searchPath: ['knex', 'public'],
};

// const defaultAdapter: any = knexAdapter(defaultConfig);
// defaultAdapter.knexAdapter = knexAdapter;
// export default defaultAdapter;

export const adapter = knexAdapter(defaultConfig);

import Debug from 'debug';
import type { Adapter, AdapterPayload } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { OidcClient, OidcPayload } from '../entities';

const debug = Debug('utils:createOidcRoute');
const TCLIENT = 7;
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
const getExpireAt = (expiresIn) =>
  expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;
const parseResult: (input: OidcPayload) => OidcPayload = (data) =>
  data && {
    ...data,
    ...JSON.parse(data.payload),
    ...(data.consumedAt && { consumed: true }),
  };

export const createOidcAdapter: (connectionName: string) => any = (connectionName) => {
  const oidcPayloadRepo = getConnection(connectionName).getRepository(OidcPayload);
  const oidcClientRepo = getConnection(connectionName).getRepository(OidcClient);

  return class PsqlAdapter implements Adapter {
    type: number;

    constructor(public name) {
      this.type = types[name];
    }

    /**
     * Update or Create an instance of an oidc-provider model.
     * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
     * encountered.
     * @param {string} id Identifier that oidc-provider will use to reference this model instance for
     * future operations.
     * @param {object} payload Object with all properties intended for storage.
     * @param {integer} expiresIn Number of seconds intended for this model to be stored.
     */
    async upsert(
      id: string,
      payload: AdapterPayload,
      expiresIn: number
    ): Promise<undefined | void> {
      debug('Upsert-id: %s', id);
      debug('payload: %O', payload);

      const expiresAt = getExpireAt(expiresIn);
      const item = {
        id,
        type: this.type,
        payload: JSON.stringify(payload),
        grantId: payload.grantId,
        userCode: payload.userCode,
        uid: payload.uid,
        expiresAt,
      };
      const preload = await oidcPayloadRepo.preload(item);
      const data = await oidcPayloadRepo.save(preload ?? item);

      debug('Upsert-result: %O', data);
    }

    /**
     * Return previously stored instance of an oidc-provider model.
     * @return {Promise} Promise fulfilled with what was previously stored for the id (when found and
     * not dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
     * when encountered.
     * @param {string} id Identifier of oidc-provider model
     */
    async find(id: string): Promise<AdapterPayload | undefined | void> {
      debug('Find instance of oidc-provider model: %s', id);

      const repo = (
        {
          [TCLIENT]: (clientId: string) => oidcClientRepo.findOne({ client_id: clientId }),
        }[this.type] || ((id) => oidcPayloadRepo.findOne({ id, type: this.type }))
      )(id);

      const data = await repo;
      // data.jwks = {
      //   keys: [
      //     {
      //       kty: 'RSA',
      //       n: 'mPV1Bc2mHCFxvtSAQkUHPlYMncXyMclSAayfBknpqznACwERQHvVksHfuf2CJSixgR7TwM2EiJuccM8Q2Er2WlCKMwMU2PYWzX-Lx2Eaiui44yfCqOJfMjhsDzoxwgosKTWmMTDOZY-NpWTe8XVisoi4Dll9UsU02ge1bABBtkgzkI7pdBC5jhQjXqClo4yLXUNataIzgAL7rE2FI_7pOz7DlMKB-46OBDA5fP9GGcb820O2u9BWMGni8qJ7Kc3oitUHEKV61IbKMxld9F6HlDLuvtrMYJFh8FzPM26wOakNhsylh1HOBLUvMNVWHa2uA0XSv0BN-1FKqEWc22kL8Q',
      //       e: 'AQAB',
      //       d: 'eccKaRlmg4T4-zZR-vDcKHv3xXEANzUSLjUR0r7r45-xztEFvDIbQqFKDtjPUehJEgTKD_lP6DcD4ShqP9nGsvbmYGC2q1mZo_hE__LGYAuSj39rUmwP4HrdRW5OiS7yI8kLzKQP3vngiup5OQH9FykUaJBE364UOvXiMd8ucgFkuQjkf_d6JDoNhsggIRxtp_dvnP1b3hBDtX5AdSfSeGkJEy4IOVp4FWEoKSKmwz0ER6Cy7A0BzFiYG-He6OYE0-FZlHMLNBrDwil23_MgIp91kDvKg61fOgpVaZS9QFxsGlhKHhABiIVIdZLv4KSj862-Qq1JXOw9vk2-0eki5Q',
      //       p: 'x9hA_qYshcTy4QaEh5aiU7hsFRZyVGeWlezfgllTFp5nizYqMUL2PZXQWtjkoqrqoOu2Ar3M3L-rog7C1EjmVOeb2NceeUVhK760IxECYAfy-DPfQ-7X3Fp7s01i4FOcmJJ9bBWTjlx8vs7IHBAf0rS2I7iRu8kCXHLT6oQteqc',
      //       q: 'w_B7-IIqoLz0zH0qHF3Md1suV7MhrZLCJHR0oT25bg9r9uSSqAIurD_0PuSUZUKOqgM-MAqYB8cN4blFjGtpdauBI9-NGfy-6NhzN8pIkp20LfJ8WKJbdQ3J1ffsmnzBKAsJ7esx6yCiNzWvrzqlZkJArng4_BM5NOqyr5cHz6c',
      //       dp: 'IqlwhHqACGejlMITpIzM9OZs4K92_wrEhJaEIdCqZ6br4KpxYP_zQ7VDYS5zYX9xmJ2pgQo4iSU5eK9EvZszUBCn6FFPeMs-0l6OUfK2Tb-zNbeRhu_bQt3yzKOkfbIi3Be0Z1XKtQt3m4S0EqH9UweC--kcZcy0eyJzfR6V4Ms',
      //       dq: 'oRsU88ojPrLfHVw0ycoeGm1wd0-ke1FWLB9M3l8gHmyzuvdJ1rakpaCYNTZBBdlp8ERmV53-TzbOJTDvDHws5EG2F0byf9GfL1j5s3-xmEvvIHBm6YHlbSN_N114v7WgJEqfSW6_RrM4bejIoW25HZGQGWRkhm9P9ECd1155X7U',
      //       qi: 'PzYbrTXT7D6fzn2evzrn9xV5cy5CoRlDSXA8C0nFyTIVMQY8xCyWzbojrVoo2Uou5VRb3FB63Ds0B8U2s9Gqa93SB_yEy4wzOtfPbZEhuVupxaZ7Luk_L0OH-El5ebo2jML2QwiDqTSeYLhIN9bb9y08u3dVswydGKmtPD-T2D4',
      //     },
      //   ],
      // };
      data.jwks = {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            kid: 'nL_5KPQjG45gpvegzs-d2pUUrjj2jRSNhI9cPK7xWG0',
            e: 'AQAB',
            n: 'mPV1Bc2mHCFxvtSAQkUHPlYMncXyMclSAayfBknpqznACwERQHvVksHfuf2CJSixgR7TwM2EiJuccM8Q2Er2WlCKMwMU2PYWzX-Lx2Eaiui44yfCqOJfMjhsDzoxwgosKTWmMTDOZY-NpWTe8XVisoi4Dll9UsU02ge1bABBtkgzkI7pdBC5jhQjXqClo4yLXUNataIzgAL7rE2FI_7pOz7DlMKB-46OBDA5fP9GGcb820O2u9BWMGni8qJ7Kc3oitUHEKV61IbKMxld9F6HlDLuvtrMYJFh8FzPM26wOakNhsylh1HOBLUvMNVWHa2uA0XSv0BN-1FKqEWc22kL8Q',
          },
        ],
      };
      const result = this.type === TCLIENT ? data : parseResult(data as OidcPayload);

      debug('Find-result, %O', result);
      return result;
    }

    /**
     * Return previously stored instance of DeviceCode by the end-user entered user code. You only
     * need this method for the deviceFlow feature
     * @return {Promise} Promise fulfilled with the stored device code object (when found and not
     * dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
     * when encountered.
     * @param {string} userCode the user_code value associated with a DeviceCode instance
     */
    async findByUserCode(userCode: string): Promise<AdapterPayload | undefined | void> {
      debug('FindByUserCode-userCode: %s', userCode);

      const data = await oidcPayloadRepo.findOne({ userCode, type: this.type });
      const result = parseResult(data);

      debug('FindByUserCode-result, %O', result);

      return result;
    }

    /**
     * Return previously stored instance of Session by its uid reference property.
     * @return {Promise} Promise fulfilled with the stored session object (when found and not
     * dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
     * when encountered.
     * @param {string} uid the uid value associated with a Session instance
     */
    async findByUid(uid: string): Promise<AdapterPayload | undefined | void> {
      debug('FindByUid-id: %s', uid);

      const data = await oidcPayloadRepo.findOne({ uid, type: this.type });
      const result = parseResult(data);

      debug('FindByUid-result, %O', result);

      return result;
    }

    /**
     * Mark a stored oidc-provider model as consumed (not yet expired though!). Future finds for this
     * id should be fulfilled with an object containing additional property named "consumed" with a
     * truthy value (timestamp, date, boolean, etc).
     * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
     * encountered.
     * @param {string} id Identifier of oidc-provider model
     */
    async consume(id: string): Promise<undefined | void> {
      debug('Consume: %s', id);

      if (this.type === TCLIENT) throw new Error('fatal error: invalid types');

      const data = oidcPayloadRepo.update({ id, type: this.type }, { consumedAt: new Date() });

      debug('Consume-result, %O', data);
    }

    /**
     * Destroy/Drop/Remove a stored oidc-provider model. Future finds for this id should be fulfilled
     * with falsy values.
     * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
     * encountered.
     * @param {string} id Identifier of oidc-provider model
     */
    async destroy(id: string): Promise<undefined | void> {
      debug('Destroy-id: %s', id);

      if (this.type === TCLIENT) throw new Error('fatal error: invalid types');

      const data = oidcPayloadRepo.delete({ id, type: this.type });

      debug('Destroy-result, %O', data);
    }

    /**
     * Destroy/Drop/Remove a stored oidc-provider model by its grantId property reference. Future
     * finds for all tokens having this grantId value should be fulfilled with falsy values.
     * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
     * encountered.
     * @param {string} grantId the grantId value associated with a this model's instance
     */
    async revokeByGrantId(grantId: string): Promise<undefined | void> {
      debug('RevokeByGrandId: grantId', grantId);

      if (this.type === TCLIENT) throw new Error('fatal error: invalid types');

      const data = oidcPayloadRepo.delete({ grantId, type: this.type });

      debug('RevokeByGrantId-result, %O', data);
    }
  };
};

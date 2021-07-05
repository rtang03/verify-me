import Debug from 'debug';
import type { Adapter } from 'oidc-provider';
import { getConnection, Repository } from 'typeorm';
import { OidcPayload } from '../entities';

const debug = Debug('utils:createOidcRoute');
const INVALID = 7;
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

export class OidcPsqlAdapter implements Adapter {
  type: number;
  repo: Repository<OidcPayload>;

  constructor(public name) {
    this.type = types[name];
    this.repo = getConnection('default').getRepository(OidcPayload);
  }

  /**
   *
   * Update or Create an instance of an oidc-provider model.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier that oidc-provider will use to reference this model instance for
   * future operations.
   * @param {object} payload Object with all properties intended for storage.
   * @param {integer} expiresIn Number of seconds intended for this model to be stored.
   *
   */
  async upsert(id: string, payload: any, expiresIn: number) {
    debug('id: %s', id);
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
    const preload = await this.repo.preload(item);
    const data = await this.repo.save(preload ?? item);
    console.log('Upsert', data);
  }

  /**
   *
   * Return previously stored instance of an oidc-provider model.
   *
   * @return {Promise} Promise fulfilled with what was previously stored for the id (when found and
   * not dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
   * when encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  async find(id: string) {
    const data = await this.repo.findOne({ id, type: this.type });
    const result = parseResult(data);
    console.log('findById', result);
    return result;
  }

  /**
   *
   * Return previously stored instance of DeviceCode by the end-user entered user code. You only
   * need this method for the deviceFlow feature
   *
   * @return {Promise} Promise fulfilled with the stored device code object (when found and not
   * dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
   * when encountered.
   * @param {string} userCode the user_code value associated with a DeviceCode instance
   *
   */
  async findByUserCode(userCode: string) {
    const data = await this.repo.findOne({ userCode, type: this.type });
    const result = parseResult(data);
    console.log('findByUserCode', result);
    return result;
  }

  /**
   *
   * Return previously stored instance of Session by its uid reference property.
   *
   * @return {Promise} Promise fulfilled with the stored session object (when found and not
   * dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
   * when encountered.
   * @param {string} uid the uid value associated with a Session instance
   *
   */
  async findByUid(uid: string) {
    const data = await this.repo.findOne({ uid, type: this.type });
    const result = parseResult(data);
    console.log('findByUid', result);
    return result;
  }

  /**
   *
   * Mark a stored oidc-provider model as consumed (not yet expired though!). Future finds for this
   * id should be fulfilled with an object containing additional property named "consumed" with a
   * truthy value (timestamp, date, boolean, etc).
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  async consume(id: string) {
    if (this.type === INVALID) throw new Error('fatal error: invalid types');

    const data = this.repo.update({ id, type: this.type }, { consumedAt: new Date() });
    console.log('consume', data);
  }

  /**
   *
   * Destroy/Drop/Remove a stored oidc-provider model. Future finds for this id should be fulfilled
   * with falsy values.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  async destroy(id: string) {
    if (this.type === INVALID) throw new Error('fatal error: invalid types');

    const data = this.repo.delete({ id, type: this.type });
    console.log('destroy', data);
  }

  /**
   *
   * Destroy/Drop/Remove a stored oidc-provider model by its grantId property reference. Future
   * finds for all tokens having this grantId value should be fulfilled with falsy values.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} grantId the grantId value associated with a this model's instance
   *
   */
  async revokeByGrantId(grantId) {
    if (this.type === INVALID) throw new Error('fatal error: invalid types');

    const data = this.repo.delete({ grantId, type: this.type });
    console.log('revokeByGrantId', data);
  }
}

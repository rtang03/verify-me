import type { IIdentifier } from '@veramo/core';
import { Identifier } from '@veramo/data-store';
import Debug from 'debug';
import type { Adapter, AdapterPayload } from 'oidc-provider';
import { getConnection } from 'typeorm';
import { OidcClient, OidcPayload } from '../entities';
import { convertKeysToJwkSecp256k1 } from './convertKeysToJwkSecp256k1';

const debug = Debug('utils:createOidcAdapter');

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
  const identifierRepo = getConnection(connectionName).getRepository(Identifier);

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

      // add keystore (public key) to each client
      if (this.type === TCLIENT) {
        const identifier: IIdentifier = await identifierRepo.findOne(data.did);
        // Note: it adds keystore, in order for OP to sign the id_token
        data.jwks = identifier && {
          keys: [convertKeysToJwkSecp256k1(identifier.controllerKeyId).publicKeyJwk],
        };
        // Note: using JARM, response_mode is "jwt". Client metadata requires "authorization_signed_response_alg"
        // The keystore above uses Secp256K1, provided by custom "did:key"; authorization_signed_response_alg must be "ES256K".
        // Therefore, hardcode here. If later allowing different did key method for Client. Below code needs refactoring.
        data.authorization_signed_response_alg = 'ES256K';

        // TODO: refactor me later
        !data.backchannel_client_notification_endpoint &&
          delete data.backchannel_client_notification_endpoint;

        !data.backchannel_authentication_request_signing_alg &&
          delete data.backchannel_authentication_request_signing_alg;
      }

      const result = this.type === TCLIENT ? data : parseResult(data as OidcPayload);

      debug('Find-result, %O', result);

      // DEBUG: find CLIENT returns
      // result = {
      //   client_id: 'V1StGXR8_Z5jdHi6B-myT',
      //   issuerId: 'ObjEGmwtFV-8Ys35WBiF5',
      //   client_secret: '98494cb8284a08a389ee1609',
      //   client_name: 'Oidc client for wallet',
      //   redirect_uris: ['https://jwt.io'],
      //   response_types: ['code'],
      //   grant_types: ['authorization_code'],
      //   token_endpoint_auth_method: 'client_secret_post',
      //   id_token_signed_response_alg: 'EdDSA',
      //   application_type: 'web',
      //   did: 'did:key:z6Mkw3i49unLBCUxqv3bUE4ZXZzVdKwXPFAJLUaThXp4qa6j',
      //   jwks: { keys: [[Object]] },
      // };

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

import Debug from 'debug';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

const debug = Debug('utils:oidc-tables:initial-migration');

export const createOidcTables1447159030001 = (database: string, schema: string) => {
  return class CreateOidcTables1447159030001 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
      const dateTimeType: string = queryRunner.connection.driver.mappedDataTypes
        .createDate as string;

      debug(`creating OidcClient table`);
      await queryRunner.createTable(
        new Table({
          database,
          schema,
          name: 'oidc_client',
          columns: [
            { name: 'client_id', type: 'varchar', isPrimary: true },
            { name: 'issuerId', type: 'varchar', isNullable: true },
            { name: 'verifierId', type: 'varchar', isNullable: true },
            { name: 'client_secret', type: 'varchar', isNullable: false },
            { name: 'client_name', type: 'varchar', isNullable: true },
            { name: 'redirect_uris', type: 'text', isNullable: true },
            { name: 'response_types', type: 'text', isNullable: true },
            { name: 'grant_types', type: 'text', isNullable: true },
            { name: 'token_endpoint_auth_method', type: 'varchar', isNullable: false },
            { name: 'id_token_signed_response_alg', type: 'varchar', isNullable: false },
            { name: 'application_type', type: 'varchar', isNullable: false },
            { name: 'did', type: 'varchar', isNullable: true },
            { name: 'backchannel_token_delivery_mode', type: 'varchar', isNullable: true },
            { name: 'backchannel_client_notification_endpoint', type: 'varchar', isNullable: true },
            {
              name: 'backchannel_authentication_request_signing_alg',
              type: 'varchar',
              isNullable: true,
            },
          ],
        }),
        true
      );

      debug(`creating OidcCredential table`);
      await queryRunner.createTable(
        new Table({
          database,
          schema,
          name: 'oidc_credential',
          columns: [
            { name: 'id', type: 'integer', isGenerated: true, isPrimary: true },
            { name: 'issuerDid', type: 'varchar', isNullable: false },
            { name: 'name', type: 'varchar', isNullable: false },
            { name: 'description', type: 'varchar', isNullable: true },
            { name: 'context', type: 'text', isNullable: false },
            { name: 'type', type: 'varchar', isNullable: false },
          ],
        }),
        true
      );

      // debug(`creating OidcClient table`);
      await queryRunner.createTable(
        new Table({
          database,
          schema,
          name: 'oidc_federated_provider',
          columns: [
            { name: 'id', type: 'integer', isGenerated: true, isPrimary: true },
            { name: 'callbackUrl', type: 'varchar', isNullable: true },
            { name: 'url', type: 'varchar', isNullable: false },
            { name: 'scope', type: 'text', isNullable: false },
            { name: 'clientId', type: 'varchar', isNullable: false },
            { name: 'clientSecret', type: 'varchar', isNullable: false },
          ],
        }),
        true
      );

      // debug(`creating OidcIssuer table`);
      await queryRunner.createTable(
        new Table({
          database,
          schema,
          name: 'oidc_issuer',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'federatedProviderId', type: 'integer', isNullable: false },
            { name: 'credentialId', type: 'integer', isNullable: true },
            { name: 'claimMappings', type: 'text', isNullable: false },
            { name: 'did', type: 'varchar', isNullable: true },
          ],
          foreignKeys: [
            {
              columnNames: ['federatedProviderId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'oidc_federated_provider',
              // TODO: revisit me
              onDelete: 'cascade',
            },
            {
              columnNames: ['credentialId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'oidc_credential',
              onDelete: 'cascade',
            },
          ],
        }),
        true
      );

      debug(`creating OidcPayload table`);
      await queryRunner.createTable(
        new Table({
          database,
          schema,
          name: 'oidc_payload',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'type', type: 'integer', isNullable: true },
            { name: 'payload', type: 'text', isNullable: true },
            { name: 'grantId', type: 'varchar', isNullable: true },
            { name: 'userCode', type: 'varchar', isNullable: true },
            { name: 'uid', type: 'varchar', isNullable: true },
            { name: 'expiresAt', type: dateTimeType, isNullable: true },
            { name: 'consumedAt', type: dateTimeType, isNullable: true },
          ],
          indices: [{ name: 'oidc_payload_uid', columnNames: ['uid'], isUnique: true }],
        }),
        true
      );

      debug(`creating OidcVerifier table`);
      await queryRunner.createTable(
        new Table({
          database,
          schema,
          name: 'oidc_verifier',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'presentationTemplateId', type: 'varchar', isNullable: true },
            { name: 'claimMappings', type: 'text', isNullable: false },
            { name: 'did', type: 'varchar', isNullable: true },
          ],
        }),
        true
      );
    }

    async down(_: QueryRunner): Promise<void> {
      throw new Error('illegal_operation: cannot roll back initial migration');
    }
  };
};

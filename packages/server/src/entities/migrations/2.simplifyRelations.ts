import Debug from 'debug';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const debug = Debug('veramo:data-store:initial-migration');

/**
 * Fix inconsistencies between Entity data and column data
 * @see https://github.com/uport-project/veramo/blob/next/packages/data-store/src/migrations/2.simplifyRelations.ts
 */
export class SimplifyRelations1447159020002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'key',
      'identifierDid',
      new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true })
    );
    await queryRunner.changeColumn(
      'service',
      'identifierDid',
      new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration');
  }
}

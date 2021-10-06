import { createVeramo1447159020001 } from './1.createVeramoDatabase';
import { SimplifyRelations1447159020002 } from './2.simplifyRelations';
import { createOidcTables1447159030001 } from './3.createOidcTables';

export const getMigrations = (database, schema) => [
  createVeramo1447159020001(database, schema),
  SimplifyRelations1447159020002,
  createOidcTables1447159030001(database, schema),
];

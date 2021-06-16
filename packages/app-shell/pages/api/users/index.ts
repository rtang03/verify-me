import { createHandlerPaginatedAgentFind } from '../../../utils';

const handler = createHandlerPaginatedAgentFind(
  'dataStoreORMGetIdentifiers',
  'dataStoreORMGetIdentifiersCount'
);

export default handler;

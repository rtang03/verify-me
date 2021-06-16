import { createHandlerPaginatedAgentFind } from '../../../utils';

const handler = createHandlerPaginatedAgentFind(
  'dataStoreORMGetMessages',
  'dataStoreORMGetMessagesCount'
);

export default handler;

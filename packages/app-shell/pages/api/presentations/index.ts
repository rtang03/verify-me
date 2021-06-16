import { createHandlerPaginatedAgentFind } from '../../../utils';

const handler = createHandlerPaginatedAgentFind(
  'dataStoreORMGetVerifiablePresentations',
  'dataStoreORMGetVerifiablePresentationsCount'
);

export default handler;

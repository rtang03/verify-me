import { createHandlerPaginatedAgentFind } from '../../../utils';

const handler = createHandlerPaginatedAgentFind(
  'dataStoreORMGetVerifiableCredentials',
  'dataStoreORMGetVerifiableCredentialsCount'
);

export default handler;

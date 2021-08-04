export const NOT_FOUND = 'Resource Not Found';
export const INVALID_PAYLOAD = 'Invalid Payload';
export const SOMETHING_WRONG = 'Something Wrong';
export const UNKNOWN_ERROR = 'Unknown Error';

export const exposedMethods: string[] = [
  'keyManagerGetKeyManagementSystems',
  'keyManagerCreate',
  'keyManagerGet',
  'keyManagerDelete',
  'keyManagerImport',
  'keyManagerEncryptJWE',
  'keyManagerDecryptJWE',
  'keyManagerSignJWT',
  'keyManagerSignEthTX',
  'didManagerGetProviders',
  'didManagerFind',
  'didManagerGet',
  'didManagerGetByAlias',
  'didManagerCreate',
  'didManagerSetAlias',
  'didManagerGetOrCreate',
  'didManagerImport',
  'didManagerDelete',
  'didManagerAddKey',
  'didManagerRemoveKey',
  'didManagerAddService',
  'didManagerRemoveService',
  'resolveDid',
  'handleMessage',
  'sendMessageDIDCommAlpha1',
  'dataStoreSaveMessage',
  'dataStoreGetMessage',
  'dataStoreSaveVerifiableCredential',
  'dataStoreGetVerifiableCredential',
  'dataStoreSaveVerifiablePresentation',
  'dataStoreGetVerifiablePresentation',
  'createVerifiablePresentation',
  'createVerifiableCredential',
  'dataStoreORMGetIdentifiers',
  'dataStoreORMGetIdentifiersCount',
  'dataStoreORMGetMessages',
  'dataStoreORMGetMessagesCount',
  'dataStoreORMGetVerifiableCredentialsByClaims',
  'dataStoreORMGetVerifiableCredentialsByClaimsCount',
  'dataStoreORMGetVerifiableCredentials',
  'dataStoreORMGetVerifiableCredentialsCount',
  'dataStoreORMGetVerifiablePresentations',
  'dataStoreORMGetVerifiablePresentationsCount',
  'createSelectiveDisclosureRequest',
  'getVerifiableCredentialsForSdr',
  'validatePresentationAgainstSdr',
  'createProfilePresentation',
  // below is v2
  'packDIDCommMessage',
  'sendDIDCommMessage',
  'getDidCommMessageMediaType',
  'unpackDIDCommMessage',
  'discoverDid',
  'dataStoreDeleteVerifiableCredential',
];

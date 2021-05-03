import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  RemoveContext,
  IAgent,
} from '@veramo/core';
import { CredentialIssuer } from '@veramo/credential-w3c';
import { KeyStore, DIDStore, IDataStoreORM } from '@veramo/data-store';
import { DIDManager } from '@veramo/did-manager';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { Connection } from 'typeorm';
import { getResolver as webDidResolver } from 'web-did-resolver';

export type TAgent = {
  didManagerGetProviders: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerGetProviders']
  >;
  didManagerFind: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerFind']
  >;
  didManagerGet: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerGet']
  >;
  didManagerGetByAlias: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerGetByAlias']
  >;
  didManagerCreate: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerCreate']
  >;
  didManagerSetAlias: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerSetAlias']
  >;
  didManagerGetOrCreate: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerGetOrCreate']
  >;
  didManagerImport: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerImport']
  >;
  didManagerDelete: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerDelete']
  >;
  didManagerAddKey: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerAddKey']
  >;
  didManagerRemoveKey: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerRemoveKey']
  >;
  didManagerAddService: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerAddService']
  >;
  didManagerRemoveService: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['didManagerRemoveService']
  >;
  keyManagerGetKeyManagementSystems: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerGetKeyManagementSystems']
  >;
  keyManagerCreate: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerCreate']
  >;
  keyManagerGet: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerGet']
  >;
  keyManagerDelete: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerDelete']
  >;
  keyManagerImport: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerImport']
  >;
  keyManagerEncryptJWE: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerEncryptJWE']
  >;
  keyManagerDecryptJWE: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerDecryptJWE']
  >;
  keyManagerSignJWT: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerSignJWT']
  >;
  keyManagerSignEthTX: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['keyManagerSignEthTX']
  >;
  dataStoreSaveMessage: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['dataStoreSaveMessage']
  >;
  dataStoreGetMessage: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['dataStoreGetMessage']
  >;
  dataStoreSaveVerifiableCredential: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['dataStoreSaveVerifiableCredential']
  >;
  dataStoreGetVerifiableCredential: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['dataStoreGetVerifiableCredential']
  >;
  dataStoreSaveVerifiablePresentation: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['dataStoreSaveVerifiablePresentation']
  >;
  dataStoreGetVerifiablePresentation: RemoveContext<
    (IDIDManager & IKeyManager & IDataStore & IResolver)['dataStoreGetVerifiablePresentation']
  >;
  resolveDid: RemoveContext<(IDIDManager & IKeyManager & IDataStore & IResolver)['resolveDid']>;
} & IAgent & { context?: IDataStoreORM };

export const setupVeramo = (connection: Promise<Connection>) =>
  createAgent<IDIDManager & IKeyManager & IDataStore & IResolver, IDataStoreORM>({
    plugins: [
      new KeyManager({
        store: new KeyStore(connection, {
          encrypt: async (message: string) => message,
          decrypt: async (encryptedMessageHex: string) => encryptedMessageHex,
        }),
        kms: { local: new KeyManagementSystem() },
      }),
      new DIDManager({
        store: new DIDStore(connection),
        defaultProvider: 'did:web',
        providers: {
          'did:web': new WebDIDProvider({ defaultKms: 'local' }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          web: webDidResolver().web,
        }),
      }),
      new CredentialIssuer(),
    ],
  });

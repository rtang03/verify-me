import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  TAgent,
  IMessageHandler,
} from '@veramo/core';
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c';
import { KeyStore, DIDStore, IDataStoreORM, DataStore } from '@veramo/data-store';
import { JwtMessageHandler } from '@veramo/did-jwt';
import { DIDManager } from '@veramo/did-manager';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { MessageHandler } from '@veramo/message-handler';
import { Resolver } from 'did-resolver';
import { Connection } from 'typeorm';
import { getResolver as webDidResolver } from 'web-did-resolver';

export type TTAgent = TAgent<
  IDIDManager & IKeyManager & IDataStore & IResolver & ICredentialIssuer & IMessageHandler
> & {
  context?: IDataStoreORM;
};

export const setupVeramo = (connection: Promise<Connection>) =>
  createAgent<
    IDIDManager & IKeyManager & IDataStore & IResolver & ICredentialIssuer & IMessageHandler,
    IDataStoreORM
  >({
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
      new MessageHandler({ messageHandlers: [new JwtMessageHandler()] }),
      new DataStore(connection),
      new CredentialIssuer(),
    ],
  });

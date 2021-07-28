import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  TAgent,
  IMessageHandler,
} from '@veramo/core';
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c';
import {
  KeyStore,
  DIDStore,
  IDataStoreORM,
  DataStore,
  DataStoreORM,
  ProfileDiscoveryProvider,
} from '@veramo/data-store';
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '@veramo/did-comm';
import { DIDCommHttpTransport } from '@veramo/did-comm/build/transports/transports';
import { IDIDDiscovery, DIDDiscovery } from '@veramo/did-discovery';
import { JwtMessageHandler } from '@veramo/did-jwt';
import { DIDManager, AliasDiscoveryProvider } from '@veramo/did-manager';
import { KeyDIDProvider } from '@veramo/did-provider-key';
import { getDidKeyResolver } from '@veramo/did-provider-key';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { MessageHandler } from '@veramo/message-handler';
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '@veramo/selective-disclosure';
import { Resolver } from 'did-resolver';
import { Connection } from 'typeorm';
import { getResolver } from 'web-did-resolver';

export type TTAgent = TAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IResolver &
    ICredentialIssuer &
    IMessageHandler &
    IDIDComm &
    ISelectiveDisclosure &
    IDIDDiscovery
> & {
  context?: IDataStoreORM;
};

// 📌  IMPORTANT: READ below integration test
// https://github.com/uport-project/veramo/blob/78836a46d3ce71b568acaa98558b64f9c2b98167/__tests__/localAgent.test.ts
export const setupVeramo = (connection: Promise<Connection>) =>
  createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IResolver &
      ICredentialIssuer &
      IMessageHandler &
      IDIDComm &
      IDIDDiscovery &
      ISelectiveDisclosure,
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
          'did:key': new KeyDIDProvider({
            defaultKms: 'local',
          }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...getResolver(),
          ...getDidKeyResolver(),
        }),
      }),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new CredentialIssuer(),
      new DIDComm([new DIDCommHttpTransport()]),
      new DataStore(connection),
      new DataStoreORM(connection),
      new SelectiveDisclosure(),
      new DIDDiscovery({
        providers: [new AliasDiscoveryProvider(), new ProfileDiscoveryProvider()],
      }),
    ],
  });

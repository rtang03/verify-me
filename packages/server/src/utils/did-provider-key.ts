import type { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core';
import { AbstractIdentifierProvider } from '@veramo/did-manager';
import Debug from 'debug';
import Multibase from 'multibase';
import Multicodec from 'multicodec';

const debug = Debug('veramo:did-key:identifier-provider');

type IContext = IAgentContext<IKeyManager>;

/**
 * change to did:key based on Secp256k1
 * NOTE: did-key of Veramo supports only Ed25519. Unfortunately, oidc-provider use Nodejs V14.x crypto module,
 * which does not support "createPrivateKey" for Ed25519. Hence, switch to Secp256K1, so that NodeJs v14 crypto
 * module works again.
 * @see https://w3c-ccg.github.io/did-method-key/#introduction
 * @see https://github.com/uport-project/veramo/blob/aabddb436b8b4dd78378da4704ba00147d074cdb/packages/did-provider-key/src/key-did-provider.ts
 */
export class KeyDIDProvider extends AbstractIdentifierProvider {
  private readonly defaultKms: string;

  constructor(options: { defaultKms: string }) {
    super();
    this.defaultKms = options.defaultKms;
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType = options?.keyType || 'Secp256k1';

    const key = await context.agent.keyManagerCreate({
      kms: kms || this.defaultKms,
      type: keyType,
    });

    const methodSpecificId = Buffer.from(
      Multibase.encode(
        'base58btc',
        Multicodec.addPrefix('secp256k1-pub', Buffer.from(key.publicKeyHex, 'hex'))
      )
    ).toString();

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:key:' + methodSpecificId,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    };
    debug('Created', identifier.did);
    return identifier;
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid });
    }
    return true;
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('KeyDIDProvider deleteIdentity not supported');
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('KeyDIDProvider addService not supported');
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('KeyDIDProvider removeKey not supported');
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('KeyDIDProvider removeService not supported');
  }
}

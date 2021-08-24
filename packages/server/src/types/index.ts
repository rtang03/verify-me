import type {
  IMessage as _IMessage,
  IDIDManagerAddServiceArgs,
  IDIDManagerRemoveServiceArgs,
  IDIDManagerGetOrCreateArgs,
  IDIDManagerDeleteArgs,
  VerifiablePresentation,
  VerifiableCredential,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreDeleteVerifiableCredentialArgs,
  IDIDManagerAddKeyArgs,
  IKeyManagerCreateArgs,
  IKey,
  IIdentifier,
  IHandleMessageArgs,
  IDataStoreSaveVerifiablePresentationArgs,
} from '@veramo/core';
import {
  ICreateVerifiablePresentationArgs,
  ICreateVerifiableCredentialArgs,
} from '@veramo/credential-w3c';
import type {
  FindArgs,
  TClaimsColumns,
  TCredentialColumns,
  TIdentifiersColumns,
  TMessageColumns,
  TPresentationColumns,
  UniqueVerifiableCredential,
  UniqueVerifiablePresentation,
} from '@veramo/data-store';
import type {
  ISendMessageDIDCommAlpha1Args,
  IPackDIDCommMessageArgs,
  IPackedDIDCommMessage,
  IUnpackDIDCommMessageArgs,
  IDIDCommMessage as _IDIDCommMessage,
  DIDCommMessagePacking,
  IUnpackedDIDCommMessage,
} from '@veramo/did-comm';
import type {
  ICredentialRequestInput,
  ICreateSelectiveDisclosureRequestArgs,
  Issuer,
  IGetVerifiableCredentialsForSdrArgs,
  ICredentialsForSdr,
  IPresentationValidationResult,
  ISelectiveDisclosure,
  ICreateProfileCredentialsArgs,
} from '@veramo/selective-disclosure';
import type { ServiceEndpoint } from 'did-resolver';
import type { CommonResponse } from './commonResponse';
import type { DidDocument } from './didDocument';
import type { Paginated } from './paginated';

export * from './commonResponse';
export * from './paginated';
export * from './didDocument';
export * from './createTenantArgs';
export * from './updateTenantArgs';
export * from './tenantManager';
export * from './createOidcIssuerClientArgs';
export * from './createOidcIssuerArgs';
export * from './createTenantArgs';
export * from './credentialRequestPayload';
export * from './credentialResponse';

export type PaginatedDIDDocument = Paginated<DidDocument>;
export type GetPaginatedDidDocument = CommonResponse<Paginated<DidDocument>>;

export type DataStoreORMGetVerifiableCredentialsArgs = FindArgs<TCredentialColumns>;
export type DataStoreORMGetIdentifiersArgs = FindArgs<TIdentifiersColumns>;
export type DataStoreORMGetIdentifiersCountArgs = FindArgs<TIdentifiersColumns>;
export type DataStoreORMGetMessagesArgs = FindArgs<TMessageColumns>;
export type DataStoreORMGetMessagesCountArgs = FindArgs<TMessageColumns>;
export type DataStoreORMGetVerifiableCredentialsByClaimsArgs = FindArgs<TClaimsColumns>;
export type DataStoreORMGetVerifiableCredentialsByClaimsCountArgs = FindArgs<TClaimsColumns>;
export type DataStoreORMGetVerifiableCredentialsCountArgs = FindArgs<TCredentialColumns>;
export type DataStoreORMGetVerifiablePresentationsArgs = FindArgs<TPresentationColumns>;
export type DataStoreORMGetVerifiablePresentationsCountArgs = FindArgs<TPresentationColumns>;

// workaround: the original ISelectiveDisclosureRequest is incorrectly typed.
// original type: "issuer: string"
// return data change to "iss: string"
export type ISelectiveDisclosureRequest = {
  iat: number;
  iss: string;
  type: string;
  subject?: string;
  replyUrl?: string;
  claims: ICredentialRequestInput[];
};
// workaround: similarly, IValidatePresentationAgainstSdrArgs needs to be changed.
export type IValidatePresentationAgainstSdrArgs = {
  presentation: VerifiablePresentation;
  sdr: ISelectiveDisclosureRequest;
};

// workaround: the original type does not export
// source: https://github.com/uport-project/veramo/blob/next/packages/did-comm/src/didcomm.ts
export interface ISendDIDCommMessageArgs {
  packedMessage: IPackedDIDCommMessage;
  messageId: string;
  returnTransportId?: string;
  recipientDidUrl: string;
}

// Seems the Agent's SendDIDCommMessage method is using old IMessage, not this one.
// So, it is not currently used.
interface IDIDCommMessage<TBody = any> extends _IDIDCommMessage {
  body: TBody | null;
}

type IMessage<TBody = any> = _IMessage & {
  data: TBody;
};

export {
  DidDocument,
  UniqueVerifiableCredential,
  UniqueVerifiablePresentation,
  ISendMessageDIDCommAlpha1Args,
  IMessage,
  ICredentialRequestInput,
  Issuer,
  IDIDManagerAddServiceArgs,
  IDIDManagerRemoveServiceArgs,
  IDIDManagerDeleteArgs,
  IDIDManagerGetOrCreateArgs,
  ICreateSelectiveDisclosureRequestArgs,
  IGetVerifiableCredentialsForSdrArgs,
  ICredentialsForSdr,
  ICreateVerifiablePresentationArgs,
  VerifiablePresentation,
  VerifiableCredential,
  ServiceEndpoint,
  IPresentationValidationResult,
  ISelectiveDisclosure,
  ICreateProfileCredentialsArgs,
  ICreateVerifiableCredentialArgs,
  IPackDIDCommMessageArgs,
  IPackedDIDCommMessage,
  IUnpackDIDCommMessageArgs,
  IDIDCommMessage,
  DIDCommMessagePacking,
  IUnpackedDIDCommMessage,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreDeleteVerifiableCredentialArgs,
  IDIDManagerAddKeyArgs,
  IKeyManagerCreateArgs,
  IKey,
  IIdentifier,
  IHandleMessageArgs,
  IDataStoreSaveVerifiablePresentationArgs,
};

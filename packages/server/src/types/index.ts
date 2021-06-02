import type { IMessage, IDIDManagerAddServiceArgs, IDIDManagerGetOrCreateArgs } from '@veramo/core';
import type {
  FindArgs,
  TClaimsColumns,
  TCredentialColumns,
  TIdentifiersColumns,
  TMessageColumns,
  TPresentationColumns,
  UniqueVerifiableCredential,
} from '@veramo/data-store';
import type { ISendMessageDIDCommAlpha1Args } from '@veramo/did-comm';
import type { ICredentialRequestInput, Issuer } from '@veramo/selective-disclosure';
import type { CommonResponse } from './commonResponse';
import type { DidDocument } from './didDocument';
import type { Paginated } from './paginated';

export * from './commonResponse';
export * from './paginated';
export * from './didDocument';
export * from './createTenantArgs';
export * from './updateTenantArgs';
export * from './tenantManager';

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

export {
  UniqueVerifiableCredential,
  ISendMessageDIDCommAlpha1Args,
  IMessage,
  ICredentialRequestInput,
  Issuer,
  IDIDManagerAddServiceArgs,
  IDIDManagerGetOrCreateArgs,
};

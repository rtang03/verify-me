import type {
  IMessage,
  IDIDManagerAddServiceArgs,
  IDIDManagerRemoveServiceArgs,
  IDIDManagerGetOrCreateArgs,
  VerifiablePresentation,
  VerifiableCredential,
} from '@veramo/core';
import { ICreateVerifiablePresentationArgs } from '@veramo/credential-w3c';
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
import type {
  ICredentialRequestInput,
  ICreateSelectiveDisclosureRequestArgs,
  Issuer,
  IGetVerifiableCredentialsForSdrArgs,
  ICredentialsForSdr,
} from '@veramo/selective-disclosure';
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
  DidDocument,
  UniqueVerifiableCredential,
  ISendMessageDIDCommAlpha1Args,
  IMessage,
  ICredentialRequestInput,
  Issuer,
  IDIDManagerAddServiceArgs,
  IDIDManagerRemoveServiceArgs,
  IDIDManagerGetOrCreateArgs,
  ICreateSelectiveDisclosureRequestArgs,
  IGetVerifiableCredentialsForSdrArgs,
  ICredentialsForSdr,
  ICreateVerifiablePresentationArgs,
  VerifiablePresentation,
  VerifiableCredential,
};

// workaround: the original ISelectiveDisclosureRequest is incorrectly typed.
export type ISelectiveDisclosureRequest = {
  iat: number;
  iss: string;
  type: string;
  subject?: string;
  replyUrl?: string;
  claims: ICredentialRequestInput[];
};

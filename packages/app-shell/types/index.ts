import type { IIdentifier } from '@veramo/core';
import type {
  Paginated,
  Tenant,
  IMessage,
  ISelectiveDisclosureRequest,
  UniqueVerifiableCredential,
  UniqueVerifiablePresentation,
} from '@verify/server';

export * from './userInfo';
export * from './commonResponse';
export * from './tenantInfo';
export * from './claim';

export type PaginatedTenant = Paginated<Partial<Tenant>>;
export type PartialTenant = Partial<Tenant>;
export type PaginatedIIdentifier = Paginated<IIdentifier>;
export type PaginatedVerifiableCredential = Paginated<UniqueVerifiableCredential>;
export type PaginatedVerifiablePresentation = Paginated<UniqueVerifiablePresentation>;
export type PaginatedMessage = Paginated<IMessage>;
export type SDRMessage = IMessage & { data: ISelectiveDisclosureRequest };

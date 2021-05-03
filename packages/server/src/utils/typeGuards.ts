import type { IIdentifier } from '@veramo/core';
import { Credentials } from '../entities/Credentials';
import { DidDocument } from '../entities/DidDocument';
import type { CreateDidDocumentPayload } from '../types';
export const isCreateDidDocumentPayload = (input: any): input is CreateDidDocumentPayload =>
  input?.id !== undefined && input?.description !== undefined && input?.controllerKey !== undefined;

export const isCreateCredentialPayload = (input: any): input is Credentials => true;

export const isDidDocument = (input: any): input is DidDocument =>
  input?.id !== undefined &&
  input?.controller !== undefined &&
  input?.verificationMethod !== undefined &&
  input?.created !== undefined;

export const isDidDocumentArray = (input: any): input is DidDocument[] =>
  Array.isArray(input) &&
  input
    .map(
      (item) =>
        item?.id !== undefined &&
        item?.controller !== undefined &&
        item?.verificationMethod !== undefined &&
        item?.created !== undefined
    )
    .reduce((prev, curr) => curr && prev, true);

export const isIdentitifer = (input: any): input is IIdentifier =>
  input.did !== undefined &&
  input.provider !== undefined &&
  input.keys !== undefined &&
  input.services !== undefined;

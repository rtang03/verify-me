import { TAgent } from '@veramo/core';
import { ICredentialIssuer, ICreateVerifiableCredentialArgs } from '@veramo/credential-w3c';

interface Claim {
  type: string;
  value: any;
}

const shortId = (did: string) => `${did.slice(0, 15)}...${did.slice(-4)}`;

const claimToObject = (arr: any[]) => {
  return arr.reduce((obj, item) => Object.assign(obj, { [item.type]: item.value }), {});
};

const issueCredential = async (
  agent: any,
  iss: string | undefined,
  sub: string | undefined,
  claims: any[],
  proofFormat: string,
  customContext?: string,
  type?: string
) => {
  return await agent?.createVerifiableCredential({
    credential: {
      issuer: { id: iss },
      issuanceDate: new Date().toISOString(),
      '@context': customContext
        ? ['https://www.w3.org/2018/credentials/v1', customContext]
        : ['https://www.w3.org/2018/credentials/v1'],
      type: type ? ['VerifiableCredential', type] : ['VerifiableCredential'],
      credentialSubject: { id: sub, ...claimToObject(claims) },
    },
    proofFormat,
    save: true,
  });
};

const signVerifiablePresentation = async (
  agent: any,
  did: string,
  verifier: string[],
  selected: any,
  proofFormat: string
) => {
  return await agent?.createVerifiablePresentation({
    presentation: {
      holder: did,
      verifier,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      verifiableCredential: selected,
    },
    proofFormat,
    save: true,
  });
};

const getCreateVerifiableCredentialArgs: (option: {
  credentialType: string;
  issuer: string;
  subject: string;
  claims: Claim[];
}) => ICreateVerifiableCredentialArgs = ({ credentialType, issuer, subject, claims }) => ({
  credential: {
    type: ['VerifiableCredential', credentialType],
    issuer: { id: issuer },
    credentialSubject: {
      id: subject,
      ...claimToObject(claims),
    },
  },
  proofFormat: 'jwt',
  save: true,
});

export {
  claimToObject,
  shortId,
  issueCredential,
  signVerifiablePresentation,
  getCreateVerifiableCredentialArgs,
};

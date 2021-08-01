export const discoverMessageType: (data: any) => {
  messageType: string;
  isVerifiiableCredential: boolean;
  isSelectiveDisclosureRequest: boolean;
  isVerifiablePresentation: boolean;
} = (data) => {
  const messageType = data?.data?.type?.[0];
  const metaDataType = data?.metaData?.[0]?.type;
  const isVerifiiableCredential =
    messageType === 'VerifiableCredential' && metaDataType === 'DIDComm';
  const isSelectiveDisclosureRequest =
    messageType === 'selective-disclosure-request' && metaDataType === 'DIDComm';
  const isVerifiablePresentation =
    messageType === 'VerifiablePresentation' && metaDataType === 'DIDComm';

  return {
    isVerifiiableCredential,
    isSelectiveDisclosureRequest,
    isVerifiablePresentation,
    messageType: isVerifiiableCredential
      ? 'Verificable Credential'
      : isSelectiveDisclosureRequest
      ? 'Selective Disclosure Request'
      : isVerifiablePresentation
      ? 'Verifiable Presentation'
      : 'unknown',
  };
};

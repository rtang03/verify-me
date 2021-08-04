export const discoverMessageType: (data: any) => {
  messageType: string;
  isVerifiiableCredential: boolean;
  isSelectiveDisclosureRequest: boolean;
  isVerifiablePresentation: boolean;
} = (data) => {
  const dataType = data?.data?.type;
  const messageType = Array.isArray(dataType) ? dataType?.[0] : dataType;
  const metaDataType = data?.metaData?.[0]?.type;
  const isVerifiiableCredential =
    messageType === 'VerifiableCredential' && metaDataType === 'DIDComm';
  const isIncomingSelectiveDisclosureRequest =
    messageType === 'selective-disclosure-request' && metaDataType === 'DIDComm';
  const isVerifiablePresentation =
    messageType === 'VerifiablePresentation' && metaDataType === 'DIDComm';
  const isOutgoingSelectiveDisclosureRequest = messageType === 'sdr' && metaDataType === 'JWT';

  return {
    isVerifiiableCredential,
    isSelectiveDisclosureRequest: isIncomingSelectiveDisclosureRequest,
    isVerifiablePresentation,
    messageType: isVerifiiableCredential
      ? 'Verificable Credential'
      : isIncomingSelectiveDisclosureRequest
      ? 'Incoming SD-Request'
      : isVerifiablePresentation
      ? 'Verifiable Presentation'
      : isOutgoingSelectiveDisclosureRequest
      ? 'Outgoing SD-Request'
      : 'unknown',
  };
};

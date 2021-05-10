import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { useFetcher } from '../utils';

interface State {
  claimType: string;
  claimValue: string;
  credentialType: string;
  customContext: string;
  issuer: string;
  subject: string;
}

const IssueCredential: React.FC<any> = () => {
  const [val, setVal] = useState<State>({
    claimType: '',
    claimValue: '',
    credentialType: '',
    customContext: '',
    issuer: '',
    subject: '',
  });

  return <>d</>;
};

export default IssueCredential;

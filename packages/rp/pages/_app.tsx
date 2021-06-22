import { UserProvider } from '@auth0/nextjs-auth0';
import type { NextPage } from 'next';
import React from 'react';

const App: NextPage<any> = ({ Component, pageProps }) => {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};

export default App;

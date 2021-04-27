import type { NextPage } from 'next';
import { Provider } from 'next-auth/client';
import React from 'react';

const App: NextPage<any> = ({ Component, pageProps }) => {
  return (
    <Provider options={{ clientMaxAge: 0, keepAlive: 0 }} session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default App;

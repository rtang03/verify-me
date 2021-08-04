import type { NextPage } from 'next';
import React from 'react';

const App: NextPage<any> = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default App;

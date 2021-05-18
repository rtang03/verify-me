import type { NextPage } from 'next';
import React from 'react';
import Layout from '../components/Layout';

const Index: NextPage<null> = () => {
  return (
    <Layout title="Home">
      Hello, Welcome to DID World!!
    </Layout>
  );
};

export default Index;

import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage, NextPageContext } from 'next';
import { getSession } from 'next-auth/client';
import React, { useState, useEffect } from 'react';

const Page: NextPage<any> = ({ session }) => {
  return <Layout title="Users"> {session ? <pre>Applications</pre> : <AccessDenied />}</Layout>;
};

export const getServerSideProps = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

export default Page;

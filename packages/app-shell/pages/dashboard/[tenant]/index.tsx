import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState, useEffect } from 'react';
import type { UserInfo } from '../../../types';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const [content, setContent] = useState<UserInfo>();

  useEffect(() => {
    fetch('/api/protected/userinfo')
      .then((res) => res.json())
      .then((json) => json?.content && setContent(json.content));
  }, [session]);

  return (
    <Layout title="Tenant">
      {session ? <pre>{JSON.stringify(content, null, 2)}</pre> : <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

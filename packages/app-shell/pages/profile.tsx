import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/client';
import React, { Fragment, useState, useEffect } from 'react';
import JSONTree from 'react-json-tree';

// client sider rendering
const Page: NextPage<any> = () => {
  const [session, loading] = useSession();
  const [content, setContent] = useState();

  useEffect(() => {
    fetch('api/protected/userinfo')
      .then((res) => res.json())
      .then((json) => json?.data && setContent(json.data));
  }, [session]);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  if (!session)
    return (
      <Layout title="Profile">
        <AccessDenied />
      </Layout>
    );

  return (
    <Layout title="Profile">
      {loading ? (
        <Fragment />
      ) : (
        <>
          <JSONTree data={content} hideRoot={true} />
        </>
      )}
    </Layout>
  );
};

export default Page;

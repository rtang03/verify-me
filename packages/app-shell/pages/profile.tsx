import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import { Session } from 'next-auth';
import React from 'react';
import JSONTree from 'react-json-tree';
import useSWR from 'swr';
import { withAuth } from '../components';
import type { CommonResponse, UserInfo } from '../types';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  // todo: upgrade to useCommonResponse
  const { data, error } = useSWR<CommonResponse<UserInfo>>('/api/userinfo');

  return (
    <Layout title="Profile">
      <Main session={session} title="User profile">
        {!!data && (
          <>
            <JSONTree data={data?.data} hideRoot={true} theme="bright" />
          </>
        )}
        {!!error && <Error />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

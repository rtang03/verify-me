import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
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
import Avatar from '@material-ui/core/Avatar';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  // todo: upgrade to useCommonResponse
  const { data, error } = useSWR<CommonResponse<UserInfo>>('/api/userinfo');

  return (
    <Layout title="Profile">
      <Main session={session} title="User profile" isLoading={!data}>
        <br />
        {!!data && (
          <Card>
            <CardHeader
              avatar={<Avatar src={data?.data?.image || 'idle'} />}
              subheader={data?.data?.name}
            />
            <CardContent>
              <JSONTree data={data?.data} hideRoot={true} />
            </CardContent>
          </Card>
        )}
        {!!error && <Error />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

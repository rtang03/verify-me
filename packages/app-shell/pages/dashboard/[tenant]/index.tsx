import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import type { Paginated, Tenant } from '@verify/server';
import { requireAuth } from 'components';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
import { useCommonResponse } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const { data, isError, isLoading } = useCommonResponse<Paginated<Partial<Tenant>>>(
    router.query.tenant as string
  );

  return (
    <Layout title="Tenant">
      <Main
        title={data?.items?.[0].slug || 'Tenant details'}
        subtitle={data?.items?.[0].id || ''}
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard">
        {isLoading ? <LinearProgress /> : <Divider />}
        {isError && !isLoading && <Error />}
        <br />
        {data?.items?.[0] && !isLoading && (
          <JSONTree data={data.items[0]} theme="bright" hideRoot={true} />
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

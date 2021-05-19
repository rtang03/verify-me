import type { Paginated, Tenant } from '@verify/server';
import { requireAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useFetcher } from '../../../utils';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import JSONTree from 'react-json-tree';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<Paginated<Partial<Tenant>>>();
  const router = useRouter();

  useEffect(() => {
    fetcher(`/api/tenants?id=${router.query.tenant}`).finally(() => true);
  }, [session]);

  return (
    <Layout title="Tenant">
      <Main
        title={val?.data?.items?.[0].slug || 'Tenant details'}
        subtitle={val?.data?.items?.[0].id || ''}
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard">
        {val.loading ? <LinearProgress /> : <Divider />}
        <br />
        {val?.data?.items?.[0] && !val.loading && (
          <JSONTree data={val.data.items[0]} theme="bright" hideRoot={true} />
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

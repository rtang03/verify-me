import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import type { Paginated, Tenant } from '@verify/server';
import { requireAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useFetcher } from '../../utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<Paginated<Tenant>>();
  const userId = (session as any)?.user?.id;

  useEffect(() => {
    fetcher(`/api/tenants?user_id=${userId}`).finally(() => true);
  }, [session]);

  return (
    <Layout title="Tenant">
      <Main session={session} title="Tenants" subtitle="List of tenants. Learn more">
        {val.loading ? <LinearProgress /> : <Divider />}
        {val.data?.items?.length && !val.loading && (
          <>
            <pre>{JSON.stringify(val.data, null, 2)}</pre>
          </>
        )}
        {!val.data?.items?.length && !val.loading && (
          <>
            <Typography variant="caption" color="secondary">
              ‼️ No tenant found. You must create first tenant to proceed.
            </Typography>
            <br />
            <br />
            <Link href="/dashboard/create">
              <Button size="small" variant="contained">
                + CREATE TENANT
              </Button>
            </Link>
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

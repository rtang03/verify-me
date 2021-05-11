import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useEffect } from 'react';
import { useFetcher } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<any>();

  useEffect(() => {
    fetcher(`/api/messages`).finally(() => true);
  }, [session]);

  return (
    <Layout title="Messages">
      {session && (
        <>
          <Typography variant="h5">Inbox</Typography>
          <Typography variant="caption">Incoming messages. Learn more</Typography>
          <br />
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          <pre>{JSON.stringify(val.data, null, 2)}</pre>
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

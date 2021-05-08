import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const { val, fetcher } = useFetcher<any>();

  useEffect(() => {
    fetcher(`/api/users/${router.query.id}`).finally(() => true);
  }, [session]);

  return (
    <Layout title="User">
      {session && (
        <>
          <Link href="/dashboard/1/users">
            <a>
              <Typography variant="caption">← Back to User-Identifiers</Typography>
            </a>
          </Link>
          <br />
          <br />
          <Typography variant="h5">User Identifier</Typography>
          <Typography variant="caption" color="secondary">
            Did-document for user
          </Typography>
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          <Divider />
          {val.data && (
            <>
              <Typography variant="h6">Did-Document</Typography>
              <JSONTree theme="bright" data={val.data} hideRoot={true} />
            </>
          )}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import type { IMessage } from '@verify/server';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useFetcher } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const { val, fetcher } = useFetcher<IMessage>();

  useEffect(() => {
    fetcher(`/api/messages/${router.query.id}`).finally(() => true);
  }, [session]);
  // useEffect(() => {
  //   if (val.data && !val.loading) {
  //     fetcher(`/api/credentialSdr`, {
  //       method: 'POST',
  //       headers: { 'Content-type': 'application/json' },
  //       body: JSON.stringify({}),
  //     }).finally(() => true);
  //   }
  // }, [val]);

  return (
    <Layout title="Messages">
      {session && (
        <>
          <Link href="/dashboard/1/messages">
            <a>
              <Typography variant="caption">← Back to Messages</Typography>
            </a>
          </Link>
          <br />
          <br />
          <Typography variant="h4">Message</Typography>
          <br />
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          {val.data && <pre>{JSON.stringify(val.data, null, 2)}</pre>}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

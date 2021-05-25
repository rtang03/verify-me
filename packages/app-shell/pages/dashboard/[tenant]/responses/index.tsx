import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { withAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useEffect, useState } from 'react';
import { useFetcher } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher();
  const [presenter, setPresenter] = useState<string>('');

  useEffect(() => {
    fetcher('/api/responses').finally(() => true);
  }, [session]);

  return (
    <Layout title="Response">
      {session && (
        <>
          <Typography variant="h4">Response</Typography>
          <Divider />
          {val?.data && (
            <>
              <pre>{JSON.stringify(val.data, null, 2)}</pre>
            </>
          )}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

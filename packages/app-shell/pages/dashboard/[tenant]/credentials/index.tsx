import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import type { Paginated } from '@verify/server';
import type { UniqueVerifiableCredential } from '@verify/server';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { useEffect, Fragment } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<Paginated<UniqueVerifiableCredential>>();

  useEffect(() => {
    fetcher('/api/credentials').finally(() => true);
  }, [session]);

  return (
    <Layout title="Credentials">
      {session && (
        <>
          <Typography variant="h4">Credentials</Typography>
          <Typography variant="caption">Create verifiable credentials. Learn more</Typography>
          <br />
          <br />
          <Link href="/dashboard/1/credentials/issue">
            <Button size="small" variant="contained">
              + Issue Credential
            </Button>
          </Link>
          {val.loading ? <LinearProgress /> : <Divider />}
          {val?.data?.items?.length ? (
            <>
              <br />
              <Typography variant="h5">Verifiable credentials</Typography>
              <Typography variant="caption">total: {val.data.total}</Typography>
              {val.data.items.map(({ verifiableCredential, hash }, index) => (
                <Fragment key={index}>
                  <JSONTree
                    theme="bright"
                    data={omit(verifiableCredential, 'proof', '@context', 'type')}
                    hideRoot={true}
                  />
                </Fragment>
              ))}
            </>
          ) : (
            <p>No record</p>
          )}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

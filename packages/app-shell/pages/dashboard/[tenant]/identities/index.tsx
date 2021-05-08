import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import type { IIdentifier } from '@veramo/core';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useEffect } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';

const webDidUrl = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<IIdentifier>();
  const createDidDocument = async () => fetcher(`/api/identitifers/create`, { method: 'POST' });

  useEffect(() => {
    fetcher(`/api/identitifers/did-json`).finally(() => true);
  }, [session]);

  return (
    <Layout title="Identifiers">
      {session && (
        <>
          <Typography variant="h5">Identitifers</Typography>
          <Typography variant="caption">
            Setup decentralized identity for web. Each tenant can have only one web did-document.
            Learn more{' '}
          </Typography>
          <br />
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          {!val.data && (
            <>
              <Typography variant="caption">
                No Did-Document for {webDidUrl}. Create web Did-Document. Learn more
              </Typography>
              <br />
              <Button size="small" variant="contained" onClick={createDidDocument}>
                + CREATE WEB DID
              </Button>
            </>
          )}
          {val.data && (
            <>
              <Typography variant="h6">Web Did-Document</Typography>
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

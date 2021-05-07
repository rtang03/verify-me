import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { Fragment, useState, useEffect } from 'react';
import JSONTree from 'react-json-tree';
import { requireAuth } from '../../../../components';
import Link from 'next/link';
import Button from '@material-ui/core/Button';

interface State {
  dids: any[];
  loading: boolean;
  result: any;
}

const webDidUrl = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const [val, setVal] = useState({ dids: [], loading: false, result: null });
  const fetcher = (url: string, option?: RequestInit) => {
    setVal({ ...val, loading: true });
    return fetch(url, option)
      .then((r) => r.json())
      .then((json) => json?.data && setVal((value) => ({ ...value, dids: json.data })));
  };

  useEffect(() => {
    fetcher(`/api/users`).finally(() => setVal((value) => ({ ...value, loading: false })));
  }, [session]);

  return (
    <Layout title="Users">
      {session && (
        <>
          <Typography variant="h5">Users Identitifers</Typography>
          <Typography variant="caption">
            Setup decentralized identity for users. Learn more
          </Typography>
          <br />
          <br />
          <Link href="/dashboard/1/users/create">
            <Button size="small" variant="contained">
              + CREATE USER IDENTIFIER
            </Button>
          </Link>
          {val.loading ? <LinearProgress /> : <Divider />}
          {val.dids?.length && (
            <>
              <Typography variant="h6">Did-Documents</Typography>
              <Typography variant="caption">total: {val.dids.length}</Typography>
              {val.dids.map((didDoc, index) => (
                <Fragment key={index}>
                  <JSONTree theme="bright" data={didDoc} hideRoot={true} />
                </Fragment>
              ))}
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

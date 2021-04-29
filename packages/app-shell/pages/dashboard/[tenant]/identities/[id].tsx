import Typography from '@material-ui/core/Typography';
import type { DidDocument } from '@verify/server';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage, NextPageContext } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useState } from 'react';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { query } = useRouter();
  const [did, setDid] = useState<DidDocument>();
  let loading = false;

  useEffect(() => {
    loading = true;
    fetch(`/api/dids/${query.id}`)
      .then((r) => r.json())
      .then((json) => {
        loading = false;
        json?.data?.data && setDid(json.data.data);
      });
  }, [session]);

  return (
    <Layout title="identity">
      {loading ? <>Loading</> : <Fragment />}
      {session ? (
        <>
          <Link href="/dashboard/1/identities">
            <a>
              <Typography variant="caption">← Back to Identities</Typography>
            </a>
          </Link>
          <br />
          <br />
          <pre>{JSON.stringify(did, null, 2)}</pre>
        </>
      ) : (
        <AccessDenied />
      )}
    </Layout>
  );
};

export const getServerSideProps = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

export default Page;

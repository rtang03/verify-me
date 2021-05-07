import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage, NextPageContext } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import JSONTree from 'react-json-tree';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const [did, setDid] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dids/${router.query.id}`)
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        json?.data && setDid(json.data);
      });
  }, [session]);

  return (
    <Layout title="Identity">
      {session ? (
        <>
          <Link href="/dashboard/1/identities">
            <a>
              <Typography variant="caption">← Back to Identities</Typography>
            </a>
          </Link>
          {loading ? <LinearProgress /> : <Divider />}
          <JSONTree theme="bright" data={did} shouldExpandNode={() =>true} />
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

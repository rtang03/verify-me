import type { Paginated, Tenant } from '@verify/server';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import type { NextPageContext } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import React, { useEffect } from 'react';
import { useFetcher } from '../../utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<Paginated<Tenant>>();

  useEffect(() => {
    fetcher(`/api/tenants`).finally(() => true);
  }, [session]);

  return <Layout title="Tenant">Hello</Layout>;
};

export const getServerSideProps = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

export default Page;

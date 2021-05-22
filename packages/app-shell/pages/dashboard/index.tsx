import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';
import { requireAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import Error from '../../components/Error';
import type { PaginatedTenant } from '../../types';
import { useCommonResponse } from '../../utils';

const PAGESIZE = 5;

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const { data, isError, isLoading } = useCommonResponse<PaginatedTenant>(
    `/api/tenants?cursor=${pageIndex * PAGESIZE}&pagesize=${PAGESIZE}`
  );
  const handlePageChange = () => (event: React.ChangeEvent<unknown>, pagenumber: number) =>
    setPageIndex((pagenumber - 1) * PAGESIZE);

  let count;
  if (data && !isLoading) count = Math.ceil(data.total / PAGESIZE);

  return (
    <Layout title="Tenant">
      <Main session={session} title="Tenants" subtitle="List of tenants. Learn more">
        {isLoading ? <LinearProgress /> : <Divider />}
        {!!data?.items?.length && !isLoading && (
          <>
            <Pagination
              count={count}
              showFirstButton
              showLastButton
              onChange={handlePageChange()}
            />
            <Typography variant="caption">Total: {data?.total || 0}</Typography>
            <JSONTree data={data.items} theme="bright" />
          </>
        )}
        {isError && !isLoading && <Error />}
        {/* WHEN NO TENTANT */}
        {data?.items?.length === 0 && !isLoading && (
          <>
            <Typography variant="caption" color="secondary">
              ‼️ No tenant found. You must create first tenant to proceed.
            </Typography>
            <br />
            <br />
            <Link href="/dashboard/create">
              <Button size="small" variant="contained">
                + CREATE TENANT
              </Button>
            </Link>
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

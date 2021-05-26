import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IIdentifier } from '@veramo/core';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import pick from 'lodash/pick';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import JSONTree from 'react-json-tree';
import type { PaginatedTenant, TenantInfo } from 'types';
import { useCommonResponse, useFetcher } from 'utils';

const webDidUrl = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { maxWidth: 550, margin: theme.spacing(3, 1, 2) },
    submit: { margin: theme.spacing(3, 2, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const classes = useStyles();

  // Query TenantInfo
  const { data, isError, isLoading } = useCommonResponse<PaginatedTenant>(
    '/api/tenants',
    router.query.tenant as string
  );
  const tenantInfo: TenantInfo | null = data
    ? pick(data.items[0], 'id', 'slug', 'name', 'activated')
    : null;

  // Create Web Did
  // const { val, fetcher } = useFetcher<IIdentifier>();
  // const createDidDocument = async () => fetcher(`/api/identitifers/create`, { method: 'POST' });
  // useEffect(() => {
  //   fetcher(`/api/identitifers/did-json`).finally(() => true);
  // }, [session]);


  return (
    <Layout title="Identifiers">
      <Main
        session={session}
        title="Issuers"
        subtitle="Setup decentralized identity for web. Each tenant can have only one web did-document.">
        <>
          {/*{val.loading ? <LinearProgress /> : <Divider />}*/}
          {/*{!val.data && (*/}
          {/*  <>*/}
          {/*    <Typography variant="caption">*/}
          {/*      No Did-Document for {webDidUrl}. Create web Did-Document. Learn more*/}
          {/*    </Typography>*/}
          {/*    <br />*/}
          {/*    <Button size="small" variant="contained" onClick={createDidDocument}>*/}
          {/*      + CREATE WEB DID*/}
          {/*    </Button>*/}
          {/*  </>*/}
          {/*)}*/}
          {/*{val.data && (*/}
          {/*  <>*/}
          {/*    <br />*/}
          {/*    <Typography variant="h5">Web Did-Document</Typography>*/}
          {/*    <JSONTree theme="bright" data={val.data} hideRoot={true} />*/}
          {/*  </>*/}
          {/*)}*/}
          {/*{() => console.log(data)}*/}
        </>
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

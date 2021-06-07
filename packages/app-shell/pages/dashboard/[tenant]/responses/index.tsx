import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { withAuth } from 'components';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import QuickAction from 'components/QuickAction';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexWrap: 'wrap', width: '70ch', backgroundColor: theme.palette.background.paper },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  return (
    <Layout title="Response">
      <Main
        session={session}
        title="Response to SDR"
        parentText={`Dashboard/${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}>
        {/*<QuickAction*/}
        {/*  link={`/dashboard/${tenantInfo?.id}/responses/create`}*/}
        {/*  label="Response to SDR"*/}
        {/*  disabled={!tenantInfo?.id}*/}
        {/*/>*/}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
        {tenantInfo?.activated && <>Do something</>}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

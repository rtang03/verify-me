import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import { Session } from 'next-auth';
import React from 'react';
import { useNextAuthUser, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    submit: { margin: theme.spacing(3, 3, 3) },
  })
);

const InviteMemberPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  return (
    <Layout title="Tenant" user={activeUser}>
      <Main
        title={slug || 'Tenant details'}
        subtitle={tenantInfo?.name || ''}
        session={session}
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {!!tenantInfo && tenantInfo.activated && <>Invite Member</>}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default InviteMemberPage;

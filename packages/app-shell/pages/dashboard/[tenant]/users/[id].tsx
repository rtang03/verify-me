import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import type { IIdentifier } from '@veramo/core';
import { withAuth } from 'components';
import AddServiceEndpoint from 'components/AddServiceEndpoint';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Identifier from 'components/Identifier';
import Layout from 'components/Layout';
import Main from 'components/Main';
import RawContent from 'components/RawContent';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import { useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
    submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
  })
);

const UsersEditPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query IIdentifier
  const id = router.query.id as string; // this is "IIdentifier.alias"
  const url = slug ? `/api/users/${id}?slug=${slug}&id={id}` : null;
  const { data, isLoading, isError, error } = useReSWR<IIdentifier>(url, !!slug);
  const isMessagingExist = data?.services
    ?.map(({ type }) => type === 'Messaging')
    .reduce((prev, curr) => prev || curr, false);

  return (
    <Layout title="User">
      <Main
        session={session}
        title="User Identifier"
        parentUrl={`/dashboard/${tenantInfo?.id}/users`}
        parentText="User-Identifiers"
        isLoading={tenantLoading || isLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && data && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={<AvatarMd5 subject={data.did || 'idle'} />}
              title="Active User"
              subheader={data.did}
            />
            <CardContent>
              <Card variant="outlined" className={classes.root}>
                <CardContent>
                  <Identifier identifier={data} />
                </CardContent>
                {!isMessagingExist && (
                  <CardContent>
                    <AddServiceEndpoint tenantInfo={tenantInfo} did={data.did} url={url} />
                  </CardContent>
                )}
              </Card>
            </CardContent>
            <RawContent title="Raw User Identifier" content={data} />
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default UsersEditPage;

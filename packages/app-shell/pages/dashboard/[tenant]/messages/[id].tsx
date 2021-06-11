import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IMessage } from '@verify/server';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import QuickAction from 'components/QuickAction';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
import { useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const MessagesEditPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query Message
  const id = router.query.id as string; // hash
  const url = slug ? `/api/messages/${id}?slug=${slug}&id=${id}` : null;
  const { data, isLoading, isError, error } = useReSWR<IMessage>(url, !!slug);

  return (
    <Layout title="Message">
      <Main
        session={session}
        title="Message"
        parentText="Messages"
        parentUrl={`/dashboard/${tenantInfo?.id}/messages`}
        isLoading={tenantLoading || isLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && data && (
          <Card className={classes.root}>
            {data.type === 'sdr' && (
              <QuickAction
                link={`/dashboard/${tenantInfo?.id}/messages/${id}/response`}
                label="SELECTIVE DISCLOSURE RESPONSE"
                disabled={!tenantInfo?.id}
              />
            )}
            <CardHeader
              className={classes.root}
              avatar={<AvatarMd5 subject={data.to || 'idle'} />}
              title={data.type}
              subheader={data.createdAt}
            />
            <CardContent>
              <JSONTree hideRoot={true} data={data} />
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default MessagesEditPage;

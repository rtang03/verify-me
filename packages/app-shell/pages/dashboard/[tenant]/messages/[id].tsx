import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IMessage } from '@verify/server';
import { withAuth } from 'components';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageCard from 'components/MessageCard';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({ root: { margin: theme.spacing(3, 1, 2) } })
);

const MessagesEditPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Message
  const id = router.query.id as string; // hash
  const url = slug ? `/api/messages/${id}?slug=${slug}&id=${id}` : null;
  const { data, isLoading, isError, error } = useReSWR<IMessage>(url, !!slug);

  return (
    <Layout title="Message" shouldShow={[show, setShow]}>
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
            <MessageCard isFull={true} tenantInfo={tenantInfo} message={data} />
            {data.type === 'sdr' && data?.metaData?.[0]?.type === 'DIDComm' && (
              <CardContent>
                <CardContent>
                  <QuickAction
                    link={`/dashboard/${tenantInfo?.id}/messages/${id}/response`}
                    label="RESPONSE"
                    disabled={!tenantInfo?.id}
                  />
                </CardContent>
              </CardContent>
            )}
            {show && <RawContent title="Raw Message" content={data} />}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default MessagesEditPage;

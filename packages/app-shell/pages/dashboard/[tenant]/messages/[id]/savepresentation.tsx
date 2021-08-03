import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IMessage } from '@verify/server';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import { useQueryDidCommMessage, useNextAuthUser, useTenant } from 'utils';
import RawContent from 'components/RawContent';
import Result from 'components/Result';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({ root: { margin: theme.spacing(3, 1, 2) } })
);

const SavePresentation: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Message
  const { message, messageId, isMessageError, isMessageLoading } = useQueryDidCommMessage(slug);

  return (
    <Layout title="Message" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={4}>
      <Main
        session={session}
        title="Save Presentation"
        parentText="Message"
        parentUrl={`/dashboard/${tenantInfo?.id}/messages/${messageId}`}
        isLoading={tenantLoading || isMessageLoading}
        isError={(tenantError && !tenantLoading) || (isMessageError && !isMessageLoading)}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && <Card className={classes.root}>Hello</Card>}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default SavePresentation;

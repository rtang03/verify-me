import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import SaveAltOutlinedIcon from '@material-ui/icons/SaveAltOutlined';
import type { IDataStoreSaveVerifiablePresentationArgs } from '@verify/server';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import Presentation from 'components/Presentation';
import ProTip from 'components/ProTip';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import {
  isVerifiablePresentation,
  useQueryDidCommMessage,
  useNextAuthUser,
  useTenant,
  useFetcher,
} from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({ root: { margin: theme.spacing(3, 1, 2) } })
);

const SavePresentation: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Message
  const { message, messageId, isMessageError, isMessageLoading } = useQueryDidCommMessage(slug);

  // Checking
  const isVerifiiablePresentationType = message?.data?.type?.[0] === 'VerifiablePresentation';
  const vp = message?.data;
  const canSave = isVerifiiablePresentationType && isVerifiablePresentation(vp);

  // Save
  const { val: saveVp, poster } = useFetcher<string>();
  const save = (body: IDataStoreSaveVerifiablePresentationArgs) =>
    poster(`/api/tenants/dataStoreSaveVerifiablePresentation?slug=${slug}`, body);

  return (
    <Layout title="Message" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={4}>
      <Main
        session={session}
        title="DIDComm Message"
        subtitle="Save Incoming Presentation"
        parentText="Message"
        parentUrl={`/dashboard/${tenantInfo?.id}/messages/${messageId}`}
        isLoading={tenantLoading || isMessageLoading}
        isError={(tenantError && !tenantLoading) || (isMessageError && !isMessageLoading)}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && message?.type !== 'application/didcomm-encrypted+json' && (
          <Typography variant="body2" color="secondary">
            Invalid type
          </Typography>
        )}
        {tenantInfo?.activated && message?.type === 'application/didcomm-encrypted+json' && (
          <Card className={classes.root}>
            {message && <MessageHeader from={message.from} to={message.to} />}
            {canSave && message?.data && (
              <CardContent>
                <Card className={classes.root} variant="outlined">
                  <CardContent>
                    <ProTip text="Presentation Found" />
                  </CardContent>
                  <Presentation vp={message.data} />
                </Card>
              </CardContent>
            )}
            {show && <RawContent title="Raw Message" content={message} />}
            {canSave && message?.data && (
              <CardContent>
                <Formik
                  initialValues={{}}
                  onSubmit={async (_, { setSubmitting }) => {
                    setSubmitting(true);
                    await save({ verifiablePresentation: message.data });
                    setSubmitting(false);
                  }}>
                  {({ submitForm, isSubmitting }) => (
                    <Form>
                      <SubmitButton
                        text={<SaveAltOutlinedIcon />}
                        disabled={isSubmitting || !!saveVp?.data || !!saveVp?.error}
                        submitForm={submitForm}
                        loading={isSubmitting}
                        tooltip="Save verifiable presentation"
                        success={!!saveVp?.data}
                        error={!!saveVp?.error}
                      />
                      <Result isTenantExist={!!tenantInfo} result={saveVp} />
                      {show && saveVp?.data && (
                        <RawContent title="Raw hash" content={{ hash: saveVp.data }} />
                      )}
                    </Form>
                  )}
                </Formik>
              </CardContent>
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default SavePresentation;

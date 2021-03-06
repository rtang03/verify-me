import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import SaveAltOutlinedIcon from '@material-ui/icons/SaveAltOutlined';
import type { VerifiableCredential, IDataStoreSaveVerifiableCredentialArgs } from '@verify/server';
import { withAuth } from 'components';
import Credential from 'components/Credential';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import ProTip from 'components/ProTip';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import {
  isVerifiableCredential,
  useQueryDidCommMessage,
  useFetcher,
  useNextAuthUser,
  useTenant,
} from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({ root: { margin: theme.spacing(3, 1, 2) } })
);

const SaveCredential: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Message
  const { message, messageId, isMessageError, isMessageLoading } = useQueryDidCommMessage(slug);

  // Save
  const { val: savedVC, poster } = useFetcher<string>();
  const save = (body: IDataStoreSaveVerifiableCredentialArgs) =>
    poster(`/api/tenants/dataStoreSaveVerifiableCredential?slug=${slug}`, body);

  const isVerifiiableCredentialType = message?.data?.type?.[0] === 'VerifiableCredential';
  const vc = message?.data;
  const canSave = isVerifiiableCredentialType && isVerifiableCredential(vc);

  return (
    <Layout title="Message" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={4}>
      <Main
        session={session}
        title="DIDComm Message"
        subtitle="Save Incoming Credential"
        parentText="Message"
        parentUrl={`/dashboard/${tenantInfo?.id}/messages/${messageId}`}
        isLoading={tenantLoading || isMessageLoading}
        isError={(tenantError && !tenantLoading) || (isMessageError && !isMessageLoading)}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {/* Save credential only if correct message type */}
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
                    <ProTip text="Credential Found" />
                  </CardContent>
                  <Credential tenantInfo={tenantInfo} vc={message.data as VerifiableCredential} />
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
                    await save({ verifiableCredential: vc as any });
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting, submitForm }) => (
                    <Form>
                      <SubmitButton
                        text={<SaveAltOutlinedIcon />}
                        disabled={isSubmitting || !!savedVC?.data || !!savedVC?.error}
                        submitForm={submitForm}
                        loading={isSubmitting}
                        tooltip="Save verifiable credential"
                        success={!!savedVC?.data}
                        error={!!savedVC?.error}
                      />
                      <Result isTenantExist={!!tenantInfo} result={savedVC} />
                      {show && savedVC?.data && (
                        <RawContent title="Raw hash" content={{ hash: savedVC.data }} />
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

export default SaveCredential;

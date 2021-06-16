import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExtensionIcon from '@material-ui/icons/Extension';
import type { VerifiableCredential, IMessage } from '@veramo/core';
import type { ISendMessageDIDCommAlpha1Args } from '@veramo/did-comm';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SendFab from 'components/SendFab';
import { Form, Formik } from 'formik';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useFetcher, useReSWR, useTenant } from 'utils';
import Credential from '../../../../components/Credential';
import ProTip from '../../../../components/ProTip';

const getSendMessageDIDCommAlpha1Args: (
  vc: VerifiableCredential
) => ISendMessageDIDCommAlpha1Args = (vc) => ({
  data: {
    from: vc.issuer.id,
    to: vc.credentialSubject.id as string,
    type: 'jwt',
    body: vc.proof.jwt,
  },
  save: true,
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    mail: { margin: theme.spacing(1, 5, 0) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
  })
);

const CredentialsDetailsPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Credential
  const id = router.query.id as string; // hash
  const url = slug ? `/api/credentials/${id}?slug=${slug}&id=${id}` : null;
  const { data: vc, isLoading, isError, error } = useReSWR<VerifiableCredential>(url, !!slug);
  const claims = vc?.credentialSubject && omit(vc?.credentialSubject, 'id');

  // Send Message
  const { val: result, poster } = useFetcher<IMessage>();
  const sendMessage = (body: ISendMessageDIDCommAlpha1Args) =>
    poster(`/api/tenants/sendMessageDIDCommAlpha1?slug=${slug}`, body);

  return (
    <Layout title="Credential" shouldShow={[show, setShow]}>
      <Main
        session={session}
        title="Credential"
        subtitle="Send verifiable credential"
        parentText="Credentials"
        parentUrl={`/dashboard/${tenantInfo?.id}/credentials`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && vc && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={<AvatarMd5 subject={id || 'idle'} image="identicon" />}
              title={JSON.stringify(vc.type, null, 2)}
              subheader={vc.issuanceDate}
            />
            <CardContent>
              <Card variant="outlined">
                <Credential vc={vc} />
                {show && vc && <RawContent content={vc} title="Raw Credential Details" />}
              </Card>
            </CardContent>
            <CardContent>
              <Card className={classes.root} variant="outlined">
                <Formik
                  initialValues={{}}
                  onSubmit={async (_, { setSubmitting }) => {
                    setSubmitting(true);
                    await sendMessage(getSendMessageDIDCommAlpha1Args(vc));
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting, submitForm }) => (
                    <Form>
                      <CardContent>
                        <ProTip text="Warning: Need to revisit this feature; temporarily disabled." />
                      </CardContent>
                      <CardHeader
                        className={classes.root}
                        title="Send Credential"
                        subheader="Click icon to send to Subject's service endpoint"
                      />
                      <CardContent className={classes.mail}>
                        {/*** TODO. This may be issue, which send credential directly. Disable it; review later. ***/}
                        <SendFab
                          loading={isSubmitting}
                          disabled={true || isSubmitting || !vc || !!result?.data}
                          submitForm={submitForm}
                          success={!!result?.data}
                          error={!!result?.error}
                        />
                      </CardContent>
                      <CardContent>
                        <MessageHeader
                          from={vc?.issuer.id}
                          to={vc?.credentialSubject?.id}
                          createdAt={vc?.issuanceDate}
                        />
                      </CardContent>
                      <CardContent>
                        <Card variant="outlined">
                          <CardHeader subheader="Claims" />
                          <CardContent>
                            {claims &&
                              Object.entries(claims).map(([key, value], index) => (
                                <MuiTextField
                                  key={index}
                                  disabled={true}
                                  size="small"
                                  label={key}
                                  value={value}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <ExtensionIcon />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              ))}
                          </CardContent>
                        </Card>
                      </CardContent>
                      <Result isTenantExist={!!tenantInfo} result={result} />
                      {show && result?.data && (
                        <RawContent content={result.data} title="Raw Send-message result" />
                      )}
                    </Form>
                  )}
                </Formik>
              </Card>
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default CredentialsDetailsPage;

import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExtensionIcon from '@material-ui/icons/Extension';
import SendIcon from '@material-ui/icons/Send';
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
import { Form, Formik } from 'formik';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher, useReSWR, useTenant } from 'utils';

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
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
    green: {
      color: '#fff',
      backgroundColor: green[500],
    },
  })
);

// Currently, it is not an Edit page. It is sending VC.
// TODO: may refactor it with right name.
const CredentialsEditPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

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
    <Layout title="Credential">
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
              avatar={<AvatarMd5 subject={id || 'idle'} />}
              title={JSON.stringify(vc.type, null, 2)}
              subheader={vc.issuanceDate}
            />
            <CardContent>
              <Card className={classes.root} variant="outlined">
                <Formik
                  initialValues={{}}
                  onSubmit={async (_, { setSubmitting }) => {
                    setSubmitting(true);
                    await sendMessage(getSendMessageDIDCommAlpha1Args(vc));
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting }) => (
                    <Form>
                      <CardHeader
                        avatar={
                          <Avatar>
                            <IconButton
                              className={classes.green}
                              disabled={isSubmitting || !vc || !!result?.data}
                              type="submit">
                              <SendIcon />
                            </IconButton>
                          </Avatar>
                        }
                        title="Send Credential"
                        subheader="Click icon to send to Subject's service endpoint"
                      />
                      <CardContent className={classes.muiTextField}>
                        <MessageHeader
                          from={vc?.issuer.id}
                          to={vc?.credentialSubject?.id}
                          createdAt={vc?.issuanceDate}
                        />
                      </CardContent>
                      <CardContent>
                        <Card variant="outlined">
                          <CardHeader subheader="Claims" />
                          <CardContent className={classes.muiTextField}>
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
                      <RawContent content={vc} title="Raw Credential Details" />
                      <Result isTenantExist={!!tenantInfo} result={result} />
                      {result?.data && !result.loading && (
                        <JSONTree hideRoot={true} data={result.data} />
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

export default CredentialsEditPage;

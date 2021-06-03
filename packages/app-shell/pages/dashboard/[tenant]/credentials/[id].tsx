import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import SendIcon from '@material-ui/icons/Send';
import TodayIcon from '@material-ui/icons/Today';
import type { VerifiableCredential, IMessage } from '@veramo/core';
import type { ISendMessageDIDCommAlpha1Args } from '@veramo/did-comm';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import { Form, Formik } from 'formik';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher, useReSWR, useTenant } from 'utils';
import Typography from '@material-ui/core/Typography';

const getSendMessageDIDCommAlpha1Args: (
  vc: VerifiableCredential
) => ISendMessageDIDCommAlpha1Args = (vc) => ({
  data: {
    from: vc.issuer.id,
    to: vc.credentialSubject.id as string,
    type: 'jwt',
    body: vc.proof.jwt,
  },
  save: false,
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexWrap: 'wrap', backgroundColor: theme.palette.background.paper },
    green: {
      color: '#fff',
      backgroundColor: green[500],
    },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query Credential
  const id = router.query.id as string; // hash
  const url = slug ? `/api/credentials/${id}?slug=${slug}&id=${id}` : null;
  const { data, isLoading, isError, error } = useReSWR<VerifiableCredential>(url, !!slug);
  const claims = data?.credentialSubject && omit(data?.credentialSubject, 'id');

  // Send Message
  const { val: result, poster } = useFetcher<IMessage>();
  const sendMessage = (body: ISendMessageDIDCommAlpha1Args) =>
    poster(`/api/credentials/send?slug=${slug}`, body);

  return (
    <Layout title="Credential">
      <Main
        session={session}
        title="Credential"
        subtitle="Send verifiable credential"
        parentText="Credentials"
        parentUrl={`/dashboard/${tenantInfo?.id}/credentials`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
        {tenantInfo?.activated && data && (
          <Card className={classes.root}>
            <CardHeader
              avatar={<AvatarMd5 subject={id || 'idle'} />}
              title={JSON.stringify(data.type, null, 2)}
              subheader={data.issuanceDate}
            />
            <CardContent>
              <Card className={classes.root} variant="outlined">
                <Formik
                  initialValues={{}}
                  onSubmit={async (_, { setSubmitting }) => {
                    setSubmitting(true);
                    await sendMessage(getSendMessageDIDCommAlpha1Args(data));
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting }) => (
                    <Form>
                      <CardHeader
                        avatar={
                          <IconButton disabled={isSubmitting || !data || !!result} type="submit">
                            <Avatar className={result ? undefined : classes.green}>
                              <SendIcon />
                            </Avatar>
                          </IconButton>
                        }
                        title="Send Credential"
                        subheader="Click me to send to Subject's service endpoint"
                      />
                      <Divider />
                      <CardContent className={classes.muiTextField}>
                        <MuiTextField
                          disabled={true}
                          size="small"
                          label="From"
                          defaultValue={data?.issuer.id}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationCityIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <br />
                        <MuiTextField
                          disabled={true}
                          size="small"
                          label="To"
                          defaultValue={data?.credentialSubject.id}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountCircle />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <br />
                        <MuiTextField
                          disabled={true}
                          size="small"
                          label="Issuance date"
                          defaultValue={data?.issuanceDate}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TodayIcon />
                              </InputAdornment>
                            ),
                          }}
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
                                  defaultValue={value}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <KeyboardArrowRightIcon />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              ))}
                          </CardContent>
                        </Card>
                      </CardContent>
                      <CardContent>
                        <Typography variant="body2">Raw Credential Details</Typography>
                        <JSONTree hideRoot={true} data={data} />
                      </CardContent>
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

export default Page;

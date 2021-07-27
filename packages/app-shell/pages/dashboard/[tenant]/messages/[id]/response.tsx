import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BorderColorOutlinedIcon from '@material-ui/icons/BorderColorOutlined';
import type {
  IMessage,
  IGetVerifiableCredentialsForSdrArgs,
  ISelectiveDisclosureRequest,
  ICredentialsForSdr,
  ICreateVerifiablePresentationArgs,
  VerifiablePresentation,
  ISendMessageDIDCommAlpha1Args,
} from '@verify/server';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import NoRecord from 'components/NoRecord';
import Presentation from 'components/Presentation';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SelectiveDisclosureReq from 'components/SelectiveDisclosureReq';
import SendFab from 'components/SendFab';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { Fragment, useState, useEffect } from 'react';
import type { PaginatedIIdentifier } from 'types';
import { useFetcher, useNextAuthUser, useReSWR, useSelectedCredentials, useTenant } from 'utils';

const PAGESIZE = 25;
const domain = process.env.NEXT_PUBLIC_DOMAIN;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '40ch' },
    longTextField: { width: '60ch' },
    submit: { margin: theme.spacing(3, 3, 2) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: '50ch',
    },
    selectEmpty: { marginTop: theme.spacing(2) },
    mail: { margin: theme.spacing(1, 5, 0) },
  })
);

const MessagesResponsePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Message
  const id = router.query.id as string; // hash
  const url = slug ? `/api/messages/${id}?slug=${slug}&id=${id}` : null;
  const {
    data: message,
    isLoading: isMessageLoading,
    isError: isMessageError,
  } = useReSWR<IMessage>(url, !!slug);
  const sdr = message?.data as ISelectiveDisclosureRequest; // message.data is generic object

  // Query Identiifer
  const idsUrl = slug ? `/api/users?slug=${slug}&cursor=0&pagesize=${PAGESIZE}` : null;
  const {
    data: ids,
    isLoading: isIdsLoading,
    isError: isIdsError,
  } = useReSWR<PaginatedIIdentifier>(idsUrl, !!slug);

  // used by Select Component to filter Users by current slug
  const filteredIds = ids?.items.filter?.((id) => id?.alias?.includes(`${slug}.${domain}:users`));

  // getVerifiableCredentialsForSdr
  const { val: requestedClaims, poster: getVerifiableCredentialsForSdr } = useFetcher<
    ICredentialsForSdr[]
  >();
  useEffect(() => {
    const body: IGetVerifiableCredentialsForSdrArgs = { sdr };
    if (sdr)
      getVerifiableCredentialsForSdr(
        `/api/tenants/getVerifiableCredentialsForSdr?slug=${slug}`,
        body
      ).finally(() => true);
  }, [message]);
  const claims = requestedClaims?.data;

  // createVerifiablePresentation
  const {
    val: signedPresentation,
    poster: createVerifiablePresentation,
  } = useFetcher<VerifiablePresentation>();
  const signPresentation = (body: ICreateVerifiablePresentationArgs) =>
    createVerifiablePresentation(`/api/requests/createVerifiablePresentation?slug=${slug}`, body);

  // sendMessageDIDCommAlpha1
  const { val: sendMessageResult, poster: sendMessage } = useFetcher<IMessage>();
  const send = (body: ISendMessageDIDCommAlpha1Args) =>
    sendMessage(`/api/tenants/sendMessageDIDCommAlpha1?slug=${slug}`, body);

  // form state
  const [presenter, setPresenter] = useState<string>('');
  const { selected, onSelect, valid: selectCredentialValid } = useSelectedCredentials(claims || []);

  return (
    <Layout title="Response" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="Selective Disclosure Response"
        subtitle="Create Selective disclosure response"
        parentText={`Message`}
        parentUrl={`/dashboard/${tenantInfo?.id}/messages/${id}`}
        isLoading={tenantLoading || isMessageLoading || isIdsLoading || requestedClaims.loading}
        isError={
          (tenantError && !tenantLoading) ||
          (isMessageError && !isMessageLoading) ||
          (isIdsError && !isIdsLoading) ||
          (requestedClaims.error && !requestedClaims.loading)
        }
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && message?.data && message?.type !== 'sdr' && (
          <Typography variant="body2" color="secondary">
            Invalid type
          </Typography>
        )}
        {tenantInfo?.activated && message?.data && message?.type === 'sdr' && (
          <Card className={classes.root}>
            {/*** Message Details ***/}
            {message && (
              <MessageHeader
                from={message.from}
                to={message.to}
                createdAt={new Date(`${message.createdAt}`).toISOString()}
              />
            )}
            {/*** Selective Discloure Payload ***/}
            {sdr && <SelectiveDisclosureReq sdr={sdr} />}
            {show && <RawContent title="Raw Selective disclosure request" content={sdr} />}
            <Divider />
            <CardContent>
              <Formik
                initialValues={{}}
                onSubmit={async (_, { setSubmitting }) => {
                  setSubmitting(true);
                  if (message?.from)
                    await signPresentation({
                      presentation: {
                        holder: presenter,
                        verifier: [message.from],
                        '@context': ['https://www.w3.org/2018/credentials/v1'],
                        verifiableCredential: Object.keys(selected).map(
                          (key) => selected[key].vc
                        ) as any,
                      },
                      proofFormat: 'jwt',
                      save: true,
                    });
                  setSubmitting(false);
                }}>
                {({ isSubmitting, submitForm }) => (
                  <Form>
                    <CardContent>
                      <Card variant="outlined">
                        {/*** Step 1 ***/}
                        <CardHeader className={classes.root} title="Step 1: Sign" />
                        {/*** Select Presenter ***/}
                        <CardContent>
                          {filteredIds?.length && (
                            <FormControl required className={classes.formControl}>
                              <InputLabel id="presenter">Presenter</InputLabel>
                              <Select
                                disabled={!!signedPresentation?.data || !!signedPresentation?.error}
                                labelId="select"
                                id="presenter"
                                value={presenter}
                                onChange={({ target: { value } }) => setPresenter(value as string)}
                                className={classes.selectEmpty}>
                                {filteredIds.map((item, index) => (
                                  <MenuItem key={index} value={item.did}>
                                    {item.alias}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </CardContent>
                        {!filteredIds?.length && <NoRecord title="Presenter *" />}
                        {/*** Requested Claims ***/}
                        <CardHeader
                          className={classes.root}
                          subheader="Choose credentials to share"
                        />
                        {claims && (
                          <CardContent>
                            <Card variant="outlined">
                              {claims.map((claim, index) => (
                                <Fragment key={index}>
                                  <CardHeader subheader={claim.claimType.toUpperCase()} />
                                  {!claim.credentials.length && (
                                    <NoRecord title="Available credentials" />
                                  )}
                                  {/*** Choose credential to share ***/}
                                  {claim.credentials.length > 0 && (
                                    <CardContent>
                                      <RadioGroup
                                        value={JSON.stringify(selected[claim.claimType]?.vc) || ''}
                                        onChange={({ target: { value } }) =>
                                          onSelect(JSON.parse(value), claim.claimType)
                                        }>
                                        {claim.credentials.map((vc, index) => (
                                          <FormControlLabel
                                            key={index}
                                            control={
                                              <Field
                                                disabled={
                                                  !!signedPresentation?.data ||
                                                  !!signedPresentation?.error
                                                }
                                                component={Radio}
                                                value={JSON.stringify(vc)}
                                              />
                                            }
                                            label={vc.verifiableCredential.credentialSubject[claim.claimType]}
                                            // label={vc.credentialSubject[claim.claimType]}
                                          />
                                        ))}
                                      </RadioGroup>
                                    </CardContent>
                                  )}
                                </Fragment>
                              ))}
                            </Card>
                          </CardContent>
                        )}
                        {show && claims && (
                          <RawContent content={claims} title="Raw Requested claims" />
                        )}
                        <CardContent>
                          <Card className={classes.root} variant="outlined">
                            {/*** Preview presentation ***/}
                            <CardHeader className={classes.root} title="Preview Presentation" />
                            <CardContent>
                              {message?.from && (
                                <Presentation
                                  vp={{
                                    holder: presenter,
                                    verifier: [message.from],
                                    verifiableCredential: Object.keys(selected).map(
                                      (key) => selected[key].vc
                                    ) as any,
                                  }}
                                />
                              )}
                            </CardContent>
                            <CardActions>
                              {/*** Sign presentation ***/}
                              <SubmitButton
                                text={<BorderColorOutlinedIcon />}
                                disabled={
                                  isSubmitting ||
                                  !sdr ||
                                  Object.keys(selected).length === 0 ||
                                  !selectCredentialValid ||
                                  !presenter ||
                                  !!signedPresentation?.data
                                }
                                submitForm={submitForm}
                                loading={isSubmitting}
                                tooltip="Sign presentation"
                                success={!!signedPresentation?.data}
                                error={!!signedPresentation?.error}
                              />
                            </CardActions>
                          </Card>
                        </CardContent>
                        <Result isTenantExist={!!tenantInfo} result={signedPresentation} />
                        {show && signedPresentation?.data && (
                          <RawContent title="Raw Signed result" content={signedPresentation.data} />
                        )}
                      </Card>
                    </CardContent>
                  </Form>
                )}
              </Formik>
              {signedPresentation?.data && message?.from && (
                <CardContent>
                  <Formik
                    initialValues={{}}
                    onSubmit={async (_, { setSubmitting }) => {
                      setSubmitting(true);
                      await send({
                        save: true,
                        ...(message?.replyUrl ? { url: message.replyUrl } : {}),
                        data: {
                          from: presenter,
                          to: message.from as string,
                          type: 'jwt',
                          body: signedPresentation.data?.proof.jwt,
                        },
                      });
                      setSubmitting(false);
                    }}>
                    {({ isSubmitting, submitForm }) => (
                      <Form>
                        <Card variant="outlined">
                          {/*** Step 2 ***/}
                          <CardHeader
                            className={classes.root}
                            title="Step 2: Verify and Send"
                            subheader="Verify below signed presentation"
                          />
                          {signedPresentation?.data && (
                            <Presentation vp={signedPresentation.data} />
                          )}
                          {show && signedPresentation?.data && (
                            <RawContent
                              content={signedPresentation.data}
                              title="Raw Signed-presentation"
                            />
                          )}
                          <CardContent>
                            <Card className={classes.root} variant="outlined">
                              {/*** Send presentation ***/}
                              <CardHeader className={classes.root} title="Send" />
                              <CardContent className={classes.mail}>
                                <SendFab
                                  tooltip="Send presentation response"
                                  loading={isSubmitting}
                                  disabled={
                                    isSubmitting ||
                                    !!sendMessageResult?.data ||
                                    !!sendMessageResult?.error
                                  }
                                  submitForm={submitForm}
                                  success={!!sendMessageResult?.data}
                                  error={!!sendMessageResult?.error}
                                />
                              </CardContent>
                              {/*** Review presentation before sending ***/}
                              <MessageHeader
                                from={presenter}
                                to={message.from}
                                url={sdr?.replyUrl}
                              />
                              <Result isTenantExist={!!tenantInfo} result={sendMessageResult} />
                              {show && sendMessageResult?.data && (
                                <RawContent
                                  title="Raw Send result"
                                  content={sendMessageResult.data}
                                />
                              )}
                            </Card>
                          </CardContent>
                        </Card>
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              )}
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default MessagesResponsePage;

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
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
  IPackedDIDCommMessage,
} from '@verify/server';
import { withAuth } from 'components';
import Error from 'components/Error';
import { TERMS } from 'components/GlossaryTerms';
import HelpButton from 'components/HelpButton';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import NoRecord from 'components/NoRecord';
import PackDIDCommMessage from 'components/PackDIDCommMessage';
import Presentation from 'components/Presentation';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SelectiveDisclosureReq from 'components/SelectiveDisclosureReq';
import SendDIDCommMessage from 'components/SendDIDCommMessage';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import jwt_decode from 'jwt-decode';
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

const ResponseSDR: NextPage<{ session: Session }> = ({ session }) => {
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
  const sdr = message?.data?.sdr && (jwt_decode(message?.data?.sdr) as ISelectiveDisclosureRequest);
  const isCorrectMessageType = message?.data?.type?.[0] === 'SDR';

  // Query Identiifer
  const idsUrl = slug ? `/api/users?slug=${slug}&cursor=0&pagesize=${PAGESIZE}` : null;
  const {
    data: ids,
    isLoading: isIdsLoading,
    isError: isIdsError,
  } = useReSWR<PaginatedIIdentifier>(idsUrl, !!slug);

  // used by Select Component to filter Users by current slug
  const filteredIds = ids?.items.filter?.((id) => id?.alias?.includes(`${slug}.${domain}:users`));

  // Note: getVerifiableCredentialsForSdr has API change:
  // In V1.2, ICredentialsForSdr returns VerifiableCredential[]
  // In V2.0, ICredentialsForSdr returns UniqueVerifiableCredential[]
  const { val: requestedClaims, poster: getVerifiableCredentialsForSdr } =
    useFetcher<ICredentialsForSdr[]>();
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
  const { val: signedPresentation, poster: createVerifiablePresentation } =
    useFetcher<VerifiablePresentation>();
  const signPresentation = (body: ICreateVerifiablePresentationArgs) =>
    createVerifiablePresentation(`/api/requests/createVerifiablePresentation?slug=${slug}`, body);

  // form state
  const [presenter, setPresenter] = useState<string>('');
  const { selected, onSelect, valid: selectCredentialValid } = useSelectedCredentials(claims || []);

  // DidComm V2 messageId
  const [messageId, setMessageId] = useState<string>('');
  const [packedPresentation, setPackedPresentation] = useState<IPackedDIDCommMessage>();

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
        {tenantInfo?.activated && message?.data && !isCorrectMessageType && (
          <Typography variant="body2" color="secondary">
            Invalid type
          </Typography>
        )}
        {tenantInfo?.activated && message?.data && isCorrectMessageType && (
          <Card className={classes.root}>
            <CardHeader
              title="Request Info"
              className={classes.root}
              action={<HelpButton terms={[TERMS.did]} />}
            />
            {/*** Message Details ***/}
            {message && (
              <CardContent>
                <Card className={classes.root} variant="outlined">
                  <MessageHeader
                    from={message.from}
                    to={message.to}
                    createdAt={message.createdAt}
                  />
                </Card>
              </CardContent>
            )}
            {/*** Selective Discloure Payload ***/}
            {sdr && (
              <CardContent>
                <Card className={classes.root} variant="outlined">
                  <SelectiveDisclosureReq sdr={sdr} />
                  {show && <RawContent title="Raw Selective disclosure request" content={sdr} />}
                </Card>
              </CardContent>
            )}
            <Formik
              initialValues={{}}
              onSubmit={async (_, { setSubmitting }) => {
                setSubmitting(true);
                // because useSelectedCredennial is incorrectly typed,
                // below ".map(item: any" is temporary hack, to extract the UniqueVerificable
                const verifiableCredential = Object.keys(selected)
                  .map((key) => selected[key].vc)
                  .map((item: any) => item.verifiableCredential);
                console.log(verifiableCredential);
                if (message?.from)
                  await signPresentation({
                    presentation: {
                      holder: presenter,
                      verifier: [message.from],
                      '@context': ['https://www.w3.org/2018/credentials/v1'],
                      verifiableCredential,
                    },
                    proofFormat: 'jwt',
                    save: true,
                  });
                setSubmitting(false);
              }}>
              {({ isSubmitting, submitForm }) => (
                <Form>
                  <CardContent>
                    <Card variant="outlined" className={classes.root}>
                      {/*** Step 1 ***/}
                      <CardHeader
                        className={classes.root}
                        title="Step 1: Sign presentation"
                        action={<HelpButton terms={[TERMS.did]} />}
                      />
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
                                          label={
                                            vc.verifiableCredential.credentialSubject[
                                              claim.claimType
                                            ]
                                          }
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
                          <CardHeader className={classes.root} title="Preview presentation" />
                          <CardContent>
                            {message?.from && (
                              <Presentation
                                show={show}
                                vp={{
                                  holder: presenter,
                                  verifier: [message.from],
                                  verifiableCredential: Object.keys(selected)
                                    .map((key) => selected[key].vc)
                                    .map((item: any) => item.verifiableCredential), // useSelectedCredennial is incorrectly typed.
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
                        <RawContent
                          title="Raw Signed-Presentation"
                          content={signedPresentation.data}
                        />
                      )}
                    </Card>
                  </CardContent>
                </Form>
              )}
            </Formik>
            {/*** Step 2 Pack Presentation ***/}
            {signedPresentation?.error && !signedPresentation.loading && (
              <Error error={signedPresentation.error} />
            )}
            {signedPresentation?.data && message?.from && (
              <CardContent className={classes.root}>
                <Card variant="outlined">
                  <CardHeader
                    className={classes.root}
                    title="Step 2: Pack presentation"
                    subheader="Click below to pack the signed-presentation into DIDComm message"
                    action={<HelpButton terms={[TERMS.did]} />}
                  />
                  <PackDIDCommMessage
                    tenantInfo={tenantInfo}
                    from={presenter}
                    to={message.from}
                    body={signedPresentation.data}
                    show={show}
                    messageId={messageId}
                    setMessageId={setMessageId}
                    setPackedMessage={setPackedPresentation}
                  />
                </Card>
              </CardContent>
            )}
            {/*** Step 3 Send Response ***/}
            {packedPresentation && (
              <CardContent className={classes.root}>
                <Card variant="outlined">
                  <CardHeader
                    className={classes.root}
                    title="Step 3: Reply to requester"
                    subheader="Reply the DIDCommMessage"
                    action={<HelpButton terms={[TERMS.did]} />}
                  />
                  <SendDIDCommMessage
                    tenantInfo={tenantInfo}
                    messageId={messageId}
                    from={presenter}
                    to={message.from as string}
                    url={sdr?.replyUrl}
                    recipientDidUrl={message.from as string}
                    packedMessage={packedPresentation}
                    show={show}
                  />
                </Card>
              </CardContent>
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default ResponseSDR;

// https://www.w3.org/2018/credentials/v1

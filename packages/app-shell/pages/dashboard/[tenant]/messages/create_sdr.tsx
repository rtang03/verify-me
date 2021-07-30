import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import type {
  IDIDCommMessage,
  Issuer,
  ICredentialRequestInput,
  ICreateSelectiveDisclosureRequestArgs,
  IPackDIDCommMessageArgs,
  IPackedDIDCommMessage,
  ISendDIDCommMessageArgs,
} from '@verify/server';
import { withAuth } from 'components';
import Error from 'components/Error';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SendFab from 'components/SendFab';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import jwt_decode from 'jwt-decode';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { useFetcher, useNextAuthUser, useTenant } from 'utils';
import { v4 as uuidv4 } from 'uuid';
import * as yup from 'yup';

interface AddClaimArgs {
  claimType: string;
  claimValue?: string;
  issuers?: Issuer[];
  essential: boolean;
  reason?: string;
}
const validation = yup.object({
  replyUrl: yup.string().url(),
  issuer: yup.string().required('Issuer is required'),
  subject: yup.string().required('Subject is required'),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '40ch' },
    longTextField: { width: '60ch' },
    submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
    mail: { margin: theme.spacing(1, 5, 0) },
  })
);

const Create_SDR: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Create SDR request
  const { val: sdrResult, poster: _newRequest } = useFetcher<string>();
  const newRequest = (body: ICreateSelectiveDisclosureRequestArgs) =>
    _newRequest(`/api/requests/create?slug=${slug}`, body);

  // form state
  const [claimType, setClaimType] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [claimRequired, setClaimRequired] = useState<boolean>(false);
  const [requiredIssuers, setRequiredIssuers] = useState<Issuer[]>([]);
  const [requiredIssuer, setRequiredIssuer] = useState<string>('');
  const [requiredIssuerUrl, setRequiredIssuerUrl] = useState<string>('');
  const [claims, setClaims] = useState<ICredentialRequestInput[]>([]);
  const addRequiredIssuer = (did: string, url?: string) => {
    setRequiredIssuers((s) => s?.concat([{ did, url: url || '' }]));
    setRequiredIssuer('');
    setRequiredIssuerUrl('');
  };
  const addClaim = (addClaimArgs: AddClaimArgs) => {
    setClaims((s) =>
      s?.concat([
        {
          claimType: addClaimArgs.claimType,
          issuers: addClaimArgs.issuers,
          essential: addClaimArgs.essential,
          reason: addClaimArgs.reason,
        },
      ])
    );
    setClaimType('');
    setReason('');
    setRequiredIssuers([]);
  };

  // form state - HelpDialog
  const [openHelp, setHelpOpen] = React.useState(false);
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  // parse SDR
  let iss = '';
  let sub = '';
  let iat = '';
  if (sdrResult?.data) {
    const sdr: any = jwt_decode(sdrResult.data);
    iss = sdr.iss;
    sub = sdr.subject;
    iat = new Date(sdr.iat * 1000).toISOString();
  }

  // DidComm V2 messageId
  const [messageId, setMessageId] = useState<string>('');

  // see example https://github.com/veramolabs/agent-explorer/blob/main/src/components/standard/CreateRequest.tsx
  // const [to, setTo] = useState('');
  // const [from, setFrom] = useState('');
  const getPackDIDCommMessageArgs: (sdr: string) => IPackDIDCommMessageArgs = (sdr) => {
    setMessageId(uuidv4());
    const message: IDIDCommMessage = {
      type: 'application/didcomm-encrypted+json',
      from: iss,
      to: sub,
      id: messageId,
      body: { type: ['SDR'], sdr },
    };
    return { message, packing: 'authcrypt' };
  };

  // Send Message
  const { val: sendMessageResult, poster: _sendDIDCommMessage } = useFetcher<string>();
  const sendDIDCommMessage = (body: ISendDIDCommMessageArgs) =>
    _sendDIDCommMessage(`/api/tenants/sendDIDCommMessage?slug=${slug}`, body);

  // Pack Message
  const { val: packedMessage, poster: pack } = useFetcher<IPackedDIDCommMessage>();
  const packDIDCommMessage = (body: IPackDIDCommMessageArgs) =>
    pack(`/api/tenants/packDIDCommMessage?slug=${slug}`, body);

  return (
    <Layout title="Request" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="Selective Disclosure Request"
        subtitle="Create Selective-Disclosure-Request"
        parentText={`Message`}
        parentUrl={`/dashboard/${tenantInfo?.id}/messages`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && (
          <Card className={classes.root}>
            {/* Step 1 Create SDR */}
            <Formik
              initialValues={{
                issuer: '',
                subject: '',
                replyUrl: '',
              }}
              validateOnChange={true}
              validationSchema={validation}
              onSubmit={async ({ issuer, subject, replyUrl }, { setSubmitting }) => {
                setSubmitting(true);
                await newRequest({
                  data: {
                    issuer,
                    subject,
                    claims: claims || [],
                    replyUrl,
                  },
                });
                setSubmitting(false);
              }}>
              {({ values, isSubmitting, submitForm }) => (
                <Form>
                  {/* Requester Info */}
                  <CardHeader
                    className={classes.root}
                    title="Requester Info"
                    action={
                      <IconButton onClick={handleHelpOpen}>
                        <HelpOutlineOutlinedIcon />
                      </IconButton>
                    }
                  />
                  <HelpDialog
                    open={openHelp}
                    handleClose={handleHelpClose}
                    content={<GlossaryTerms terms={[TERMS.did]} />}
                  />
                  <CardContent>
                    <Field
                      disabled={!!sdrResult?.data}
                      className={classes.longTextField}
                      label="Issuer"
                      size="small"
                      component={TextField}
                      name={'issuer'}
                      placeholder={'Issuer DID'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                      autoFocus={true}
                    />
                    <br />
                    <Field
                      disabled={!!sdrResult?.data}
                      className={classes.longTextField}
                      label="Subject"
                      size="small"
                      component={TextField}
                      name={'subject'}
                      placeholder={'Subject DID'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                    />
                    <br />
                    <Field
                      disabled={!!sdrResult?.data}
                      className={classes.longTextField}
                      label="Reply url"
                      size="small"
                      component={TextField}
                      name={'replyUrl'}
                      placeholder={'Reply Url'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                    />
                  </CardContent>
                  {/* Claim Details */}
                  <CardContent>
                    <Card variant="outlined">
                      <CardHeader className={classes.root} title="Claim Details" />
                      {claims.length > 0 && (
                        <RawContent content={claims} title="Preview claim details" />
                      )}
                      <CardContent>
                        <Typography variant="caption">Add one claim type</Typography>
                        <div>
                          <MuiTextField
                            disabled={!!sdrResult?.data}
                            className={classes.textField}
                            label="Claim Type"
                            size="small"
                            name={'claimType'}
                            placeholder={'Claim type'}
                            variant="outlined"
                            margin="normal"
                            value={claimType}
                            onChange={({ target: { value } }) => setClaimType(value)}
                          />
                          {<br />}
                          <MuiTextField
                            disabled={!!sdrResult?.data}
                            className={classes.textField}
                            label="Reason"
                            size="small"
                            name={'reason'}
                            placeholder={'Reason'}
                            variant="outlined"
                            margin="normal"
                            value={reason}
                            onChange={({ target: { value } }) => setReason(value)}
                          />
                        </div>
                        <br />
                        {/* Required issuers */}
                        <Card variant="outlined">
                          <CardHeader className={classes.root} subheader="Required issuers" />
                          {requiredIssuers?.length > 0 && (
                            <RawContent content={requiredIssuers} title="Preview issuers" />
                          )}
                          <CardContent>
                            <div>
                              <Typography variant="caption">Add one issuer</Typography>
                            </div>
                            <MuiTextField
                              disabled={!!sdrResult?.data}
                              className={classes.longTextField}
                              label="Required Issuer"
                              size="small"
                              name={'requiredIssuer'}
                              placeholder={'Required Issuer'}
                              variant="outlined"
                              margin="normal"
                              value={requiredIssuer}
                              onChange={({ target: { value } }) => setRequiredIssuer(value)}
                            />
                            <br />
                            <MuiTextField
                              disabled={!!sdrResult?.data}
                              className={classes.longTextField}
                              label="Required Issuer Url"
                              size="small"
                              name={'requiredIssuerUrl'}
                              placeholder={'Required Issuer Url'}
                              variant="outlined"
                              margin="normal"
                              value={requiredIssuerUrl}
                              onChange={({ target: { value } }) => setRequiredIssuerUrl(value)}
                            />
                          </CardContent>
                          <CardActions>
                            <Button
                              disabled={!requiredIssuerUrl || !requiredIssuer}
                              className={classes.submit}
                              variant="outlined"
                              color="inherit"
                              size="small"
                              onClick={() => addRequiredIssuer(requiredIssuer, requiredIssuerUrl)}>
                              + Issuer
                            </Button>
                          </CardActions>
                        </Card>
                      </CardContent>
                      <CardActions>
                        <Button
                          disabled={!claimType || requiredIssuers.length === 0}
                          className={classes.submit}
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() =>
                            addClaim({
                              claimType,
                              issuers: requiredIssuers,
                              essential: claimRequired,
                              reason,
                            })
                          }>
                          + claim
                        </Button>
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={
                                !!sdrResult?.data || !claimType || requiredIssuers.length === 0
                              }
                              checked={claimRequired}
                              onChange={({ target: { checked } }) => setClaimRequired(checked)}
                            />
                          }
                          label={<Typography variant="caption">Mandatory</Typography>}
                        />
                      </CardActions>
                    </Card>
                  </CardContent>
                  <CardActions>
                    <SubmitButton
                      tooltip="Create Request"
                      text={<PlusOneIcon />}
                      submitForm={submitForm}
                      loading={isSubmitting}
                      success={!!sdrResult?.data}
                      error={!!sdrResult?.error}
                      disabled={
                        isSubmitting ||
                        !!sdrResult?.data ||
                        !values.issuer ||
                        !values.subject ||
                        !values.replyUrl ||
                        claims.length === 0 ||
                        sdrResult?.error
                      }
                    />
                  </CardActions>
                  {show && sdrResult?.data && (
                    <RawContent title="Raw SDR" content={{ data: sdrResult.data }} />
                  )}
                </Form>
              )}
            </Formik>
            {/* Step 2 Pack SDR */}
            <CardContent>
              {sdrResult?.error && !sdrResult?.loading && <Error error={sdrResult.error} />}
              {sdrResult?.data && !sdrResult?.loading && (
                <Card className={classes.root} variant="outlined">
                  <Formik
                    initialValues={{}}
                    onSubmit={async (_, { setSubmitting }) => {
                      setSubmitting(true);
                      await packDIDCommMessage(getPackDIDCommMessageArgs(sdrResult.data as string));
                      setSubmitting(false);
                    }}>
                    {({ isSubmitting, submitForm }) => (
                      <Form>
                        <CardHeader
                          className={classes.root}
                          title="Step 1: Pack Request"
                          subheader="Click icon to pack it into DIDComm message"
                        />
                        <CardContent>
                          <SendFab
                            loading={isSubmitting}
                            submitForm={submitForm}
                            icon="pack"
                            disabled={isSubmitting || !sdrResult?.data || !!packedMessage?.data}
                            success={!!packedMessage?.data}
                            error={!!packedMessage?.error}
                          />
                        </CardContent>
                        <CardContent>
                          <MessageHeader from={iss} to={sub} />
                          <RawContent
                            title="Selective Disclosure Request - raw"
                            content={{ data: sdrResult.data }}
                          />
                        </CardContent>
                        <Result isTenantExist={!!tenantInfo} result={packedMessage} />
                        {show && packedMessage?.data && (
                          <RawContent content={packedMessage.data} title="Raw Pack-message" />
                        )}
                      </Form>
                    )}
                  </Formik>
                </Card>
              )}
            </CardContent>
            {/* Step 3 Send DidComm SDR */}
            <CardContent>
              {packedMessage?.error && !packedMessage?.loading && (
                <Error error={packedMessage.error} />
              )}
              {packedMessage?.data && !packedMessage?.loading && (
                <Formik
                  initialValues={{}}
                  onSubmit={async (_, { setSubmitting }) => {
                    setSubmitting(true);
                    await sendDIDCommMessage({
                      messageId,
                      packedMessage: packedMessage.data as IPackedDIDCommMessage,
                      recipientDidUrl: sub,
                    });
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting, submitForm }) => (
                    <Form>
                      <Card variant="outlined">
                        <CardHeader
                          className={classes.root}
                          title="Step 2: Selective Disclosure Request"
                          subheader="Click icon to send below message"
                        />
                        <CardContent className={classes.mail}>
                          <SendFab
                            tooltip="Send the SDR"
                            loading={isSubmitting}
                            disabled={
                              isSubmitting ||
                              !packedMessage?.data?.message ||
                              !!sendMessageResult?.data
                            }
                            submitForm={submitForm}
                            success={!!sendMessageResult?.data}
                            error={!!sendMessageResult?.error}
                          />
                        </CardContent>
                        {iss && sub && <MessageHeader from={iss} to={sub} createdAt={iat} />}
                        <Result isTenantExist={!!tenantInfo} result={sendMessageResult} />
                        {show && sendMessageResult?.data && (
                          <RawContent
                            title="Raw Send result"
                            content={{ transportId: sendMessageResult.data, messageId }}
                          />
                        )}
                      </Card>
                    </Form>
                  )}
                </Formik>
              )}
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Create_SDR;

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BorderColorOutlinedIcon from '@material-ui/icons/BorderColorOutlined';
import ScreenShareOutlinedIcon from '@material-ui/icons/ScreenShareOutlined';
import Pagination from '@material-ui/lab/Pagination';
import type {
  ICreateVerifiablePresentationArgs,
  VerifiablePresentation,
  IPackedDIDCommMessage,
} from '@verify/server';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Credential from 'components/Credential';
import Switch from 'components/CustomSwitch';
import CustomSwitch from 'components/CustomSwitch';
import Error from 'components/Error';
import { TERMS } from 'components/GlossaryTerms';
import HelpButton from 'components/HelpButton';
import Layout from 'components/Layout';
import Main from 'components/Main';
import PackDIDCommMessage from 'components/PackDIDCommMessage';
import Presentation from 'components/Presentation';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SendDIDCommMessage from 'components/SendDIDCommMessage';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import {
  useFetcher,
  useNextAuthUser,
  usePagination,
  useQueryCredential,
  useQueryIdentifier,
  useTenant,
} from 'utils';

type Checked = {
  [x: string]: boolean;
};

const NUMBER_OF_CREDENTIAL = 50;
const NUMBER_OF_ISSUER_DID = 20;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '50ch' },
    formControl: {
      margin: theme.spacing(1),
      minWidth: '50ch',
    },
    selectEmpty: { marginTop: theme.spacing(2) },
    mail: { margin: theme.spacing(1, 5, 0) },
  })
);

const Create: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query all identifer of active tenant, for Select control "Issuer DID"
  const { isQueryIdentifierError, isQueryIdentifierLoading, paginatedIdentifier } =
    useQueryIdentifier({
      slug,
      pageSize: NUMBER_OF_ISSUER_DID,
      shouldFetch: !!slug && !!tenantInfo?.activated,
    });
  const issuers = paginatedIdentifier?.items;

  // Query credential
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const { isQueryCredentialError, isQueryCredentialLoading, paginatedCredential } =
    useQueryCredential({ slug, pageSize: NUMBER_OF_CREDENTIAL, shouldFetch });

  // Pagination
  const { cursor, pageChange } = usePagination(1);

  // createVerifiablePresentation
  const { val: signedPresentation, poster: createVerifiablePresentation } =
    useFetcher<VerifiablePresentation>();
  const signPresentation = (body: ICreateVerifiablePresentationArgs) =>
    createVerifiablePresentation(`/api/tenants/createVerifiablePresentation?slug=${slug}`, body);

  // selectedCredential
  const [checked, setChecked] = useState<Checked>({});
  const handleSwitchChange = ({ target }: React.ChangeEvent<HTMLInputElement>) =>
    setChecked({ ...checked, [target.name]: target.checked });
  const selectedVerifiableCredentialHash = Object.entries(checked)
    .filter(([_, value]) => value)
    .map(([hash]) => hash);
  const selectedVerifiableCredential = paginatedCredential?.items
    ?.filter(({ hash }) => selectedVerifiableCredentialHash.includes(hash))
    ?.map(({ verifiableCredential }) => verifiableCredential);

  // SaveOnly - SaveAndSend switch
  const [saveOnly, setSaveOnly] = useState(false);
  const handleSaveOnly = ({ target }: React.ChangeEvent<HTMLInputElement>) =>
    setSaveOnly(target.checked);

  // DidComm V2 messageId
  const [messageId, setMessageId] = useState<string>('');
  const [packedPresentation, setPackedPresentation] = useState<IPackedDIDCommMessage>();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  return (
    <Layout title="Presentation" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={3}>
      <Main
        session={session}
        title="Create Presentation"
        subtitle="Issuer creates verifier presentation and send to"
        parentText="Presentations"
        parentUrl={`/dashboard/${tenantInfo?.id}/presentations`}
        isLoading={tenantLoading || isQueryIdentifierLoading || isQueryCredentialLoading}
        isError={
          (tenantError && !tenantLoading) ||
          (isQueryIdentifierError && !isQueryIdentifierLoading) ||
          (isQueryCredentialError && !isQueryCredentialLoading)
        }
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              title="Verifiable presentation"
              avatar={
                <CardHeaderAvatar>
                  <ScreenShareOutlinedIcon />
                </CardHeaderAvatar>
              }
              action={
                <CustomSwitch
                  disabled={!!signedPresentation?.data}
                  name="SaveOnlySwitch"
                  label={saveOnly ? 'Save only' : 'Save / send'}
                  handleChange={handleSaveOnly}
                  state={saveOnly}
                />
              }
            />
            {/* Signed-Presentation */}
            <CardContent className={classes.root}>
              <Card variant="outlined">
                <Formik
                  initialValues={{ verifier: '', issuer: '' }}
                  onSubmit={async ({ verifier, issuer }, { setSubmitting }) => {
                    setSubmitting(true);
                    await signPresentation({
                      presentation: {
                        holder: issuer,
                        verifier,
                        '@context': ['https://www.w3.org/2018/credentials/v1'],
                        verifiableCredential: selectedVerifiableCredential,
                      },
                      proofFormat: 'jwt',
                      save: true,
                    });
                    setFrom(issuer);
                    setTo(verifier);
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting, submitForm, values, setValues }) => (
                    <Form>
                      <CardContent className={classes.root}>
                        {/* Select Issuer DID */}
                        {issuers?.length && (
                          <FormControl required className={classes.formControl}>
                            <InputLabel id="Issuer">Issuer</InputLabel>
                            <Select
                              disabled={!!signedPresentation?.data || !!signedPresentation?.error}
                              value={values.issuer}
                              className={classes.selectEmpty}
                              onChange={({ target: { value } }) =>
                                setValues({ ...values, issuer: value as string })
                              }>
                              {issuers.map(({ did }) => (
                                <MenuItem key={did} value={did}>
                                  {did}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <br />
                        {/* Verifier DID */}
                        <Field
                          disabled={!!signedPresentation?.data}
                          className={classes.textField}
                          label="Verifier"
                          size="small"
                          component={TextField}
                          name={'verifier'}
                          placeholder={'did:web:verifier.example.com'}
                          variant="outlined"
                          margin="normal"
                          fullwidth="true"
                          autoFocus={true}
                        />
                      </CardContent>
                      {paginatedCredential?.items[cursor].verifiableCredential && (
                        <CardContent className={classes.root}>
                          <Card variant="outlined">
                            <Pagination
                              disabled={!!signedPresentation?.data}
                              variant="outlined"
                              shape="rounded"
                              count={paginatedCredential?.total || 0}
                              showFirstButton
                              showLastButton
                              onChange={pageChange}
                            />
                            <CardContent>
                              <CardHeader
                                className={classes.root}
                                title="Select credentials to create presentation"
                                action={
                                  <Switch
                                    label={
                                      checked[paginatedCredential.items[cursor].hash]
                                        ? 'Added'
                                        : 'Available'
                                    }
                                    disabled={!!signedPresentation?.data}
                                    state={checked[paginatedCredential.items[cursor].hash]}
                                    handleChange={handleSwitchChange}
                                    name={paginatedCredential.items[cursor].hash}
                                  />
                                }
                              />
                            </CardContent>
                            <CardContent className={classes.root}>
                              <Card variant="outlined">
                                <Credential
                                  vc={paginatedCredential.items[cursor].verifiableCredential}
                                  hash={paginatedCredential?.items?.[cursor].hash}
                                  tenantInfo={tenantInfo}
                                />
                              </Card>
                            </CardContent>
                          </Card>
                        </CardContent>
                      )}
                      {/*** Preview presentation ***/}
                      {values?.issuer &&
                        values?.verifier &&
                        selectedVerifiableCredential &&
                        selectedVerifiableCredential.length > 0 && (
                          <CardContent>
                            <Card className={classes.root} variant="outlined">
                              <CardHeader className={classes.root} title="Preview presentation" />
                              <CardContent>
                                <Presentation
                                  show={show}
                                  vp={{
                                    holder: values.issuer,
                                    verifier: [values.verifier],
                                    verifiableCredential: selectedVerifiableCredential,
                                  }}
                                />
                              </CardContent>
                            </Card>
                          </CardContent>
                        )}
                      <CardActions>
                        {/*** Sign presentation ***/}
                        <SubmitButton
                          text={<BorderColorOutlinedIcon />}
                          disabled={
                            isSubmitting ||
                            !!signedPresentation?.data ||
                            !!signedPresentation?.error ||
                            !values?.issuer ||
                            !values?.verifier ||
                            !selectedVerifiableCredential?.length
                          }
                          submitForm={submitForm}
                          loading={isSubmitting}
                          tooltip="Sign presentation"
                          success={!!signedPresentation?.data}
                          error={!!signedPresentation?.error}
                        />
                      </CardActions>
                      <Result isTenantExist={!!tenantInfo} result={signedPresentation} />
                      {show && signedPresentation?.data && (
                        <RawContent
                          title="Raw Signed-Presentation"
                          content={signedPresentation.data}
                        />
                      )}
                    </Form>
                  )}
                </Formik>
              </Card>
            </CardContent>
            {!saveOnly && signedPresentation?.error && !signedPresentation.loading && (
              <Error error={signedPresentation.error} />
            )}
            {/*** Pack ***/}
            {!saveOnly && signedPresentation?.data && (
              <CardContent className={classes.root}>
                <Card variant="outlined">
                  <CardHeader
                    className={classes.root}
                    title="Pack presentation"
                    subheader="Click below to pack the signed-presentation into DIDComm message"
                    action={<HelpButton terms={[TERMS.did]} />}
                  />
                  <PackDIDCommMessage
                    tenantInfo={tenantInfo}
                    show={show}
                    from={from}
                    to={to}
                    body={signedPresentation.data}
                    messageId={messageId}
                    setMessageId={setMessageId}
                    setPackedMessage={setPackedPresentation}
                  />
                </Card>
              </CardContent>
            )}
            {/*** Send ***/}
            {!saveOnly && packedPresentation && (
              <CardContent className={classes.root}>
                <Card variant="outlined">
                  <CardHeader
                    className={classes.root}
                    title="Send presentation"
                    action={<HelpButton terms={[TERMS.did]} />}
                  />
                  <SendDIDCommMessage
                    tenantInfo={tenantInfo}
                    show={show}
                    from={from}
                    to={to}
                    url={''}
                    messageId={messageId}
                    recipientDidUrl={to}
                    packedMessage={packedPresentation}
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

export default Create;

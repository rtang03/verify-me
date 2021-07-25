import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import type { VerifiableCredential, ICreateVerifiableCredentialArgs } from '@verify/server';
import { withAuth } from 'components';
import Credential from 'components/Credential';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import Layout from 'components/Layout';
import Main from 'components/Main';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import type { Claim } from 'types';
import { claimToObject, useFetcher, getCreateVerifiableCredentialArgs, useTenant } from 'utils';
import * as yup from 'yup';

// @see https://github.com/veramolabs/agent-explorer/blob/next/src/components/widgets/IssueCredential.tsx

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '45ch', margin: theme.spacing(1) },
    claimTextField: { width: '30ch' },
    submit: { width: '18ch', margin: theme.spacing(3, 3, 3) },
  })
);
const validation = yup.object({
  credentialType: yup.string().required('Credential type is required'),
  issuer: yup.string().required('Issuer is required'),
  subject: yup.string().required('Subject is required'),
});

const CredentialsIssuePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Issue credential
  const { val: result, poster } = useFetcher<VerifiableCredential>();
  const issue = (body: ICreateVerifiableCredentialArgs) =>
    poster(`/api/tenants/createVerifiableCredential?slug=${slug}`, body);

  // used for pre-selected value in Select component
  const [claims, updateClaims] = useState<Claim[]>([]);
  const [claimType, setClaimType] = useState<string>('');
  const [claimValue, setClaimValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<null | string>();
  const updateClaimFields = (field: Claim) => {
    const claimTypes = claims.map((field: Claim) => field.type);
    const newfields = claims.concat([field]);
    setErrorMessage(null);
    if (claimTypes.includes(field.type)) {
      setErrorMessage('Claim type already exists');
      return;
    }
    updateClaims(newfields);
    setClaimType('');
    setClaimValue('');
  };

  // form state - HelpDialog
  const [openHelp, setHelpOpen] = React.useState(false);
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <Layout title="Credential" shouldShow={[show, setShow]} user={session.user}>
      <Main
        session={session}
        title="Issue Credential"
        parentText="Credentials"
        parentUrl={`/dashboard/${tenantInfo?.id}/credentials`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo && tenantInfo.activated && (
          <Formik
            initialValues={{
              credentialType: '',
              issuer: '',
              subject: '',
            }}
            validateOnChange={true}
            validationSchema={validation}
            onSubmit={async (input, { setSubmitting }) => {
              setSubmitting(true);
              await issue(getCreateVerifiableCredentialArgs({ ...input, claims }));
              setSubmitting(false);
            }}>
            {({ isSubmitting, errors, submitForm }) => (
              <Form>
                <Card className={classes.root}>
                  <CardHeader
                    className={classes.root}
                    title="Credential Info"
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
                  <CardContent className={classes.root}>
                    <Field
                      className={classes.textField}
                      label="Issuer"
                      size="small"
                      component={TextField}
                      name={'issuer'}
                      placeholder={'issuer'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                      autoFocus={true}
                      disabled={result?.data}
                    />
                    <br />
                    <Field
                      className={classes.textField}
                      label="Subject"
                      size="small"
                      component={TextField}
                      name={'subject'}
                      placeholder={'subject'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                      disabled={result?.data}
                    />
                    <br />
                    <Field
                      className={classes.textField}
                      label="Credential Type"
                      size="small"
                      component={TextField}
                      name={'credentialType'}
                      placeholder={'credential type e.g Profile'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                      disabled={result?.data}
                    />
                  </CardContent>
                  <CardContent>
                    <Card variant="outlined">
                      <CardHeader
                        className={classes.root}
                        title="Add Claim(s)"
                        subheader="At least one claim is required"
                      />
                      <CardContent>
                        <MuiTextField
                          className={classes.claimTextField}
                          label="Claim Type"
                          size="small"
                          placeholder={'claim type e.g. name'}
                          variant="outlined"
                          margin="normal"
                          value={claimType}
                          onChange={({ target }) => setClaimType(target.value)}
                        />{' '}
                        <MuiTextField
                          className={classes.claimTextField}
                          label="Claim Value"
                          size="small"
                          placeholder={'claim value e.g. Alice'}
                          variant="outlined"
                          margin="normal"
                          value={claimValue}
                          onChange={({ target }) => setClaimValue(target.value)}
                        />
                      </CardContent>
                      <CardActions>
                        <Button
                          className={classes.submit}
                          disabled={!claimType || !claimValue}
                          size="small"
                          color="inherit"
                          variant="outlined"
                          onClick={() => updateClaimFields({ type: claimType, value: claimValue })}>
                          + Claim
                        </Button>
                        {errorMessage && (
                          <Typography variant="caption" color="secondary">
                            {errorMessage}
                          </Typography>
                        )}
                      </CardActions>
                      {!!claims?.length && (
                        <CardContent>
                          <Card variant="outlined">
                            <CardHeader
                              subheader="Claims Preview"
                              action={
                                !!claims.length && (
                                  <Button
                                    disabled={!!result?.data}
                                    variant="outlined"
                                    color="inherit"
                                    size="small"
                                    onClick={() => updateClaims([])}>
                                    X Reset
                                  </Button>
                                )
                              }
                            />
                            <CardContent>
                              <JSONTree hideRoot={true} data={claimToObject(claims)} />
                            </CardContent>
                          </Card>
                        </CardContent>
                      )}
                    </Card>
                  </CardContent>
                  <CardActions>
                    <SubmitButton
                      tooltip="Issue credential"
                      text={<PlusOneIcon />}
                      submitForm={submitForm}
                      loading={isSubmitting}
                      disabled={
                        isSubmitting ||
                        !!errors?.credentialType ||
                        !!errors?.subject ||
                        !!errors?.issuer ||
                        !claims.length ||
                        !!result?.data
                      }
                      success={!!result?.data}
                      error={!!result?.error}
                    />
                  </CardActions>
                  <Result isTenantExist={!!tenantInfo} result={result} />
                  {result?.data && !result.loading && (
                    <>
                      <CardContent>
                        <Credential vc={result.data} />
                      </CardContent>
                      {show && <RawContent title="Raw Credential" content={result.data} />}
                    </>
                  )}
                </Card>
              </Form>
            )}
          </Formik>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default CredentialsIssuePage;

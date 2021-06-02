import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import type { VerifiableCredential } from '@veramo/core';
import type { ICreateVerifiableCredentialArgs } from '@veramo/credential-w3c';
import { withAuth } from 'components';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import { mutate } from 'swr';
import type { PaginatedTenant } from 'types';
import {
  claimToObject,
  getTenantInfo,
  useFetcher,
  useReSWR,
  getCreateVerifiableCredentialArgs,
} from 'utils';
import * as yup from 'yup';

// @see https://github.com/veramolabs/agent-explorer/blob/next/src/components/widgets/IssueCredential.tsx
interface Claim {
  type: string;
  value: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexWrap: 'wrap', width: '70ch', backgroundColor: theme.palette.background.paper },
    textField: { width: '45ch' },
    claimTextField: { width: '30ch' },
    submit: { margin: theme.spacing(3, 3, 2) },
  })
);
const validation = yup.object({
  credentialType: yup.string().required('Credential type is required'),
  issuer: yup.string().required('Issuer is required'),
  subject: yup.string().required('Subject is required'),
});

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const tenantId = router.query.tenant as string;

  // Query TenantInfo
  const {
    data: tenant,
    isError: tenantError,
    isLoading: tenantLoading,
  } = useReSWR<PaginatedTenant>(`/api/tenants?id=${tenantId}`, tenantId !== '0');
  const tenantInfo = getTenantInfo(tenant);
  const slug = tenantInfo?.slug;

  // Issue credential
  const { val: result, poster } = useFetcher<VerifiableCredential>();
  const issue = (body: ICreateVerifiableCredentialArgs) =>
    poster(`/api/credentials/issue?slug=${slug}`, body);

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

  return (
    <Layout title="Credential">
      <Main
        session={session}
        title="Issue credential"
        parentText="Credentials"
        parentUrl={`/dashboard/${tenantInfo?.id}/credentials`}
        isLoading={tenantLoading}>
        {tenantError && !tenantLoading && <Error />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
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
          {({ isSubmitting, errors }) => (
            <Form>
              <Card className={classes.root}>
                <CardContent>
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
                <CardActions>
                  <Button
                    className={classes.submit}
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !!errors?.credentialType ||
                      !!errors?.subject ||
                      !!errors?.issuer ||
                      !claims.length ||
                      !!result?.data
                    }>
                    Issue Credential
                  </Button>
                </CardActions>
                <CardContent>
                  <Card>
                    <CardHeader title="Add Claim(s)" subheader="At least one claim is required" />
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
                        variant="contained"
                        onClick={() => updateClaimFields({ type: claimType, value: claimValue })}>
                        Add Claim
                      </Button>
                      {errorMessage && (
                        <Typography variant="caption" color="secondary">
                          {errorMessage}
                        </Typography>
                      )}
                    </CardActions>
                    <CardContent>
                      <Card>
                        <CardContent>
                          <Typography variant="body2">Claims preview</Typography>
                          <JSONTree hideRoot={true} theme="bright" data={claimToObject(claims)} />
                        </CardContent>
                        <CardActions>
                          {!!claims.length && (
                            <Button
                              disabled={!!result?.data}
                              variant="outlined"
                              size="small"
                              onClick={() => updateClaims([])}>
                              X Remove all claims
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </CardContent>
                  </Card>
                </CardContent>
                <Result isTenantExist={!!tenantInfo} result={result} />
                {result?.data && !result.loading && <JSONTree hideRoot={true} data={result.data} />}
              </Card>
            </Form>
          )}
        </Formik>
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

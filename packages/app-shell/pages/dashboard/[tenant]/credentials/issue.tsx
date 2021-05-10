import { createStyles, ListItemText } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { IIdentifier } from '@veramo/core';
import type { Paginated } from '@verify/server';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import JSONTree from 'react-json-tree';
import { claimToObject, useFetcher } from 'utils';
import * as yup from 'yup';

// @see https://github.com/veramolabs/agent-explorer/blob/next/src/components/widgets/IssueCredential.tsx

interface Claim {
  type: string;
  value: any;
}
interface State {
  credentialType: string;
  issuer: string;
  subject: string;
}
const initialValues = {
  credentialType: '',
  issuer: '',
  subject: '',
};
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: { width: '40ch' },
    claimTextField: { width: '30ch' },
    submit: { margin: theme.spacing(3, 0, 2) },
  })
);
const validation = yup.object({
  credentialType: yup.string().required('Credential type is required'),
  issuer: yup.string().required('Issuer is required'),
  subject: yup.string().required('Subject is required'),
});

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { val: result, fetcher: issueCredential } = useFetcher<any>();
  // used for pre-selected value in Select component
  const { val, fetcher } = useFetcher<Paginated<IIdentifier>>();
  const [claims, updateClaims] = useState<Claim[]>([]);
  const [claimType, setClaimType] = useState<string>('');
  const [claimValue, setClaimValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<null | string>();

  useEffect(() => {
    fetcher(`/api/users`).finally(() => true);
  }, [session]);

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
      {session && (
        <>
          <Link href="/dashboard/1/credentials">
            <a>
              <Typography variant="caption">← Back to Credentials</Typography>
            </a>
          </Link>
          <br />
          <br />
          <Typography variant="h5">Issue credential</Typography>
          <br />
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          <Formik
            initialValues={initialValues}
            validateOnChange={true}
            validationSchema={validation}
            onSubmit={async (input, { setSubmitting }) => {
              setSubmitting(true);
              await issueCredential('/api/credentials/issue', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ ...input, claims: claimToObject(claims) }),
              }).finally(() => setSubmitting(false));
            }}>
            {({ values, isSubmitting, errors }) => (
              <Form>
                <div>
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
                  />
                </div>
                <div>
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
                  />
                </div>
                <div>
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
                  />
                </div>
                <p>
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
                </p>
              </Form>
            )}
          </Formik>
          <Typography variant="h6">Add Claim(s)</Typography>
          <Typography variant="caption">At least one claim is required</Typography>
          <Divider variant="inset" />
          <List dense={true}>
            <ListItem>
              <ListItemText>
                <MuiTextField
                  className={classes.claimTextField}
                  label="Claim Type"
                  size="small"
                  placeholder={'claim type e.g. name'}
                  variant="outlined"
                  margin="normal"
                  value={claimType}
                  onChange={(e: any) => setClaimType(e.target.value)}
                />{' '}
                <MuiTextField
                  className={classes.claimTextField}
                  label="Claim Value"
                  size="small"
                  placeholder={'claim value e.g. Alice'}
                  variant="outlined"
                  margin="normal"
                  value={claimValue}
                  onChange={(e: any) => setClaimValue(e.target.value)}
                />{' '}
              </ListItemText>
              <Button
                disabled={!claimType || !claimValue}
                size="small"
                variant="contained"
                onClick={() => updateClaimFields({ type: claimType, value: claimValue })}>
                Add Claim
              </Button>
            </ListItem>
          </List>
          <Typography variant="caption" color="secondary">
            {errorMessage}
          </Typography>
          <br />
          <br />
          <Typography variant="h6">Claims preview</Typography>

          <JSONTree hideRoot={true} theme="bright" data={claimToObject(claims)} />
          {!!claims.length && (
            <p>
              <Button size="small" onClick={() => updateClaims([])}>
                X Remove all claims
              </Button>
            </p>
          )}
          <Divider />
          {result?.data && !result.loading && (
            <>
              <br />
              <Typography variant="h6" color="secondary">
                Credential is successfully issued.{' '}
              </Typography>
              <JSONTree theme="bright" hideRoot={true} data={result.data} />
            </>
          )}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

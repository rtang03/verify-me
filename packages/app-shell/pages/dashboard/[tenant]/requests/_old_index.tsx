import { createStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import type { ICredentialRequestInput, Issuer } from '@verify/server';
import { withAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';

interface SDRArgs {
  issuer: string;
  subject?: string;
  claims: ICredentialRequestInput[];
  replyUrl?: string;
}

interface AddClaimArgs {
  claimType: string;
  claimValue?: string;
  issuers?: Issuer[];
  essential: boolean;
  reason?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: { width: '40ch' },
    longTextField: { width: '80ch' },
    submit: { margin: theme.spacing(3, 0, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { val, fetcher } = useFetcher();
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

  return (
    <Layout title="Request">
      {session && (
        <>
          <Typography variant="h4">Selective Disclosure Request</Typography>
          <Typography variant="caption">Create Selective-Disclosure-Request. Learn more</Typography>
          <br />
          <br />
          <Divider />
          <Formik
            initialValues={{
              issuer: '',
              subject: '',
              replyUrl: '',
            }}
            onSubmit={async ({ issuer, subject, replyUrl }, { setSubmitting }) => {
              setSubmitting(true);
              const args: SDRArgs = {
                issuer,
                subject,
                claims: claims || [],
                replyUrl,
              };
              await fetcher('/api/requests/create', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(args),
              }).finally(() => {
                setClaims([]);
                setSubmitting(false);
              });
            }}>
            {({ isSubmitting }) => (
              <Form>
                <div>
                  <Field
                    className={classes.textField}
                    label="Issuer"
                    size="small"
                    component={TextField}
                    name={'issuer'}
                    placeholder={'Issuer DID'}
                    variant="outlined"
                    margin="normal"
                    fullwidth="true"
                    autoFocus={true}
                  />{' '}
                  <Field
                    className={classes.textField}
                    label="Subject"
                    size="small"
                    component={TextField}
                    name={'subject'}
                    placeholder={'Subject DID'}
                    variant="outlined"
                    margin="normal"
                    fullwidth="true"
                  />
                </div>
                <div>
                  <Field
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
                </div>
                <br />
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">Claim details</Typography>
                    {claims && (
                      <>
                        <Typography variant="caption">Preview claim details</Typography>
                        <JSONTree data={claims} hideRoot={true} />
                      </>
                    )}
                    <Typography variant="caption">Add one claim</Typography>
                    <div>
                      <MuiTextField
                        className={classes.textField}
                        label="Claim Type"
                        size="small"
                        name={'claimType'}
                        placeholder={'Claim type'}
                        variant="outlined"
                        margin="normal"
                        value={claimType}
                        onChange={({ target: { value } }) => setClaimType(value)}
                      />{' '}
                      <MuiTextField
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
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">Required issuers</Typography>
                        {requiredIssuers?.length > 0 && (
                          <>
                            <Typography variant="caption">Preview issuers</Typography>
                            <JSONTree data={requiredIssuers} hideRoot={true} />
                          </>
                        )}
                        <div>
                          <Typography variant="caption">Add one issuer</Typography>
                        </div>
                        <MuiTextField
                          className={classes.textField}
                          label="Required Issuer"
                          size="small"
                          name={'requiredIssuer'}
                          placeholder={'Required Issuer'}
                          variant="outlined"
                          margin="normal"
                          value={requiredIssuer}
                          onChange={({ target: { value } }) => setRequiredIssuer(value)}
                        />{' '}
                        <MuiTextField
                          className={classes.textField}
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
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => addRequiredIssuer(requiredIssuer, requiredIssuerUrl)}>
                          Add Issuer
                        </Button>
                      </CardActions>
                    </Card>
                  </CardContent>
                  <CardActions>
                    <Button
                      disabled={!claimType}
                      className={classes.submit}
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() =>
                        addClaim({
                          claimType,
                          issuers: requiredIssuers,
                          essential: claimRequired,
                          reason,
                        })
                      }>
                      Add claim
                    </Button>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={claimRequired}
                          onChange={({ target: { checked } }) => setClaimRequired(checked)}
                        />
                      }
                      label="Mandatory Claim"
                    />
                  </CardActions>
                </Card>
                <br />
                <Divider />
                <div>
                  <Button
                    className={classes.submit}
                    variant="contained"
                    color="primary"
                    size="small"
                    type="submit"
                    disabled={isSubmitting || val.data || val.error}>
                    Create Selective-Disclosure-Request
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
          <Divider />
          <div>Status</div>
          {val.data && <pre>{JSON.stringify(val.data, null, 2)}</pre>}
          <div>Error</div>
          {val.error && <pre>{JSON.stringify(val.error, null, 2)}</pre>}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

// eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE2MjA4MTIzNjMsInR5cGUiOiJzZHIiLCJzdWJqZWN0IjoiZGlkOndlYjplNmQ2NjA5NDE3NDkubmdyb2suaW86dXNlcnM6cGV0ZXIiLCJjbGFpbXMiOlt7ImNsYWltVHlwZSI6ImdlbmRlciIsImNsYWltVmFsdWUiOiJtIiwiaXNzdWVycyI6W3siZGlkIjoiZGlkOndlYjplNmQ2NjA5NDE3NDkubmdyb2suaW8iLCJ1cmwiOiJodHRwOi8vZTZkNjYwOTQxNzQ5Lm5ncm9rLmlvIn1dLCJlc3NlbnRpYWwiOmZhbHNlLCJyZWFzb24iOiJ0ZXN0aW5nIn1dLCJyZXBseVVybCI6IiIsImlzcyI6ImRpZDp3ZWI6ZTZkNjYwOTQxNzQ5Lm5ncm9rLmlvIn0.tjxA9MbQQbicE6gWT_ssVmiIEOF282CkfdlPomUBqvvP1ElgGyTfWjOTD_GSAd2_X629oSLG-EVY6t6tmqk3Dw

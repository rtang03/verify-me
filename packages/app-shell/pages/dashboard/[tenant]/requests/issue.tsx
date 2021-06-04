import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import type {
  Issuer,
  ICredentialRequestInput,
  ICreateSelectiveDisclosureRequestArgs,
} from '@verify/server';
import { withAuth } from 'components';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher, useTenant } from 'utils';

interface AddClaimArgs {
  claimType: string;
  claimValue?: string;
  issuers?: Issuer[];
  essential: boolean;
  reason?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexWrap: 'wrap', width: '70ch', backgroundColor: theme.palette.background.paper },
    textField: { width: '40ch' },
    longTextField: { width: '60ch' },
    submit: { margin: theme.spacing(3, 3, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Create request
  const { val: result, poster } = useFetcher<any>();
  const newRequest = (body: ICreateSelectiveDisclosureRequestArgs) =>
    poster(`/api/requests/create?slug=${slug}`, body);

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

  return (
    <Layout title="Request">
      <Main
        session={session}
        title="Selective Disclosure Request"
        subtitle="Create Selective-Disclosure-Request"
        parentText={`Dashboard/${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}>
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
        {tenantInfo?.activated && (
          <Formik
            initialValues={{
              issuer: '',
              subject: '',
              replyUrl: '',
            }}
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
            {({ isSubmitting }) => (
              <Form>
                <Card className={classes.root}>
                  <CardHeader title="Requester Info" />
                  <CardContent>
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
                    />
                    <br />
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
                    <br />
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
                  </CardContent>
                  <CardContent>
                    <Card variant="outlined">
                      <CardHeader subheader="Claim Details" />
                      <CardContent>
                        {claims && (
                          <>
                            <Typography variant="body2">Preview claim details</Typography>
                            <JSONTree data={claims} hideRoot={true} />
                          </>
                        )}
                        <Typography variant="caption">Add one claim type</Typography>
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
                          <CardHeader subheader="Required issuers" />
                          <CardContent>
                            {requiredIssuers?.length > 0 && (
                              <>
                                <Typography variant="body2">Preview issuers</Typography>
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
                  </CardContent>
                  <CardActions>
                    <Button
                      className={classes.submit}
                      variant="contained"
                      color="primary"
                      size="small"
                      type="submit"
                      disabled={isSubmitting || !!result?.data}>
                      + Selective Disclosure Request
                    </Button>
                  </CardActions>
                  <Result isTenantExist={!!tenantInfo} result={result} />
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

export default Page;

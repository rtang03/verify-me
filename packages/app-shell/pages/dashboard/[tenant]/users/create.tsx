import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import type { IIdentifier } from '@veramo/core';
import { withAuth } from 'components';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import LowerCaseTextField from 'components/LowerCaseTextField';
import Main from 'components/Main';
import Success from 'components/Success';
import { Form, Field, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
import { mutate } from 'swr';
import type { PaginatedTenant } from 'types';
import { getTenantInfo, useFetcher, useReSWR } from 'utils';
import * as yup from 'yup';

const domain = process.env.NEXT_PUBLIC_BACKEND?.split(':')[1].replace('//', '');
const validation = yup.object({
  username: yup
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(20, 'Must be less  than 20 characters')
    .required('Alias is required')
    .matches(/^[a-zA-Z0-9]+$/, 'Cannot contain special characters or spaces'),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      maxWidth: 500,
    },
    textField: { width: '40ch' },
    submit: { margin: theme.spacing(3, 2, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const tenantId = router.query.tenant as string;

  // Query TenantInfo
  const {
    data: tenant,
    isError: tenantError,
    isLoading: tenantLoading,
  } = useReSWR<PaginatedTenant>('/api/tenants', tenantId, tenantId !== '0');
  const tenantInfo = getTenantInfo(tenant);

  // Create User Identifier
  const { val: userDid, poster } = useFetcher<IIdentifier>();

  return (
    <Layout title="User">
      <Main
        session={session}
        title="Create User Identifier"
        parentUrl={`/dashboard/${tenantInfo?.id}/users`}
        parentText={`User-Identifiers`}>
        {tenantLoading || userDid.loading ? <LinearProgress /> : <Divider />}
        {tenantError || (userDid.error && <Error />)}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        {tenantInfo?.activated && (
          <Formik
            initialValues={{ username: '' }}
            validateOnChange={true}
            validationSchema={validation}
            onSubmit={async ({ username }, { setSubmitting }) => {
              setSubmitting(true);
              const key = tenantInfo?.slug
                ? `/api/users/${username}?slug=${tenantInfo.slug}`
                : null;
              const newUser = (body: any) =>
                mutate(key, poster('/api/users?slug=${tenantInfo?.slug}', body));
              await newUser({ username }).then(() => setSubmitting(false));
            }}>
            {({ values: { username }, isSubmitting, errors }) => (
              <Form>
                <br />
                <Card className={classes.root}>
                  <CardHeader
                    title="User identifier"
                    subheader="Only lower-case and _ underscore is allowed. Special characters and space disabled."
                  />
                  <CardContent>
                    <Typography variant="caption">You are </Typography>
                    <Typography variant="caption" color="primary">
                      {username
                        ? `"did:web:${tenantInfo.slug}.${domain}:users:${username}"`
                        : '...'}
                    </Typography>
                    <br />
                    <br />
                    <Field
                      disabled={!!userDid?.data}
                      className={classes.textField}
                      label="Alias for User Identiifier"
                      size="small"
                      component={LowerCaseTextField}
                      name={'username'}
                      placeholder={'a short memorable name'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                      autoFocus={true}
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      className={classes.submit}
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isSubmitting || !!errors?.username || !username || !!userDid?.data}>
                      Submit
                    </Button>
                  </CardActions>
                </Card>
              </Form>
            )}
          </Formik>
        )}
        {/* after creation succeeds*/}
        {userDid?.data && !userDid.loading && (
          <>
            <br />
            <Divider />
            <Success />
            <JSONTree theme="bright" data={userDid.data} />
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

import { createStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import type { IIdentifier } from '@veramo/core';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';
import * as yup from 'yup';

const validation = yup.object({
  username: yup
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(20, 'Must be less  than 20 characters')
    .required('Username is required')
    .matches(/^[a-zA-Z0-9]+$/, 'Cannot contain special characters or spaces'),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: { width: '40ch' },
    submit: { margin: theme.spacing(3, 0, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { val, fetcher } = useFetcher<IIdentifier>();

  return (
    <Layout title="User">
      {session && (
        <>
          <Link href="/dashboard/1/users">
            <a>
              <Typography variant="caption">← Back to User-Identifiers</Typography>
            </a>
          </Link>
          <br />
          <br />
          <Typography variant="h5">Create User Identifier</Typography>
          <Typography variant="caption" color="secondary">
            Did-document for user
          </Typography>
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          <Formik
            initialValues={{ username: '' }}
            validateOnChange={true}
            validationSchema={validation}
            onSubmit={async ({ username }, { setSubmitting }) => {
              setSubmitting(true);
              await fetcher('/api/users/create', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ username }),
              }).finally(() => setSubmitting(false));
            }}>
            {({ values, isSubmitting, errors }) => (
              <Form>
                <Field
                  disabled={val.data}
                  className={classes.textField}
                  label="User name"
                  size="small"
                  component={TextField}
                  name={'username'}
                  placeholder={'username'}
                  variant="outlined"
                  margin="normal"
                  fullwidth="true"
                  autoFocus={true}
                />
                <p>
                  <Button
                    className={classes.submit}
                    variant="contained"
                    color="primary"
                    size="small"
                    type="submit"
                    disabled={
                      isSubmitting || !!errors?.username || !values?.username || !!val?.data
                    }>
                    Submit
                  </Button>
                </p>
              </Form>
            )}
          </Formik>
          <Divider />
          {val.data && !val.loading && (
            <>
              <Typography variant="h6" color="secondary">
                Did-document is successfully created.
              </Typography>
              <JSONTree theme="bright" data={val.data} />
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

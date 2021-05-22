import { createStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Layout from 'components/Layout';
import LowerCaseTextField from 'components/LowerCaseTextField';
import Main from 'components/Main';
import { Form, Field, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';
import * as yup from 'yup';
import { requireAuth } from '../../components';
import { PartialTenant } from '../../types';

const validation = yup.object({
  slug: yup
    .string()
    .min(5, 'Must be at least 5 characters')
    .max(20, 'Must be less  than 20 characters')
    .required('tenant name is required')
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
  const { val, poster } = useFetcher<PartialTenant>();
  const user_id = (session as any)?.user?.id;
  const newTenant = (body: any) => poster('/api/tenants', body);

  return (
    <Layout title="Tenant">
      <Main
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard"
        title="Create Tenant"
        subtitle="Each tenant does .... Learn more.">
        {val.loading ? <LinearProgress /> : <Divider />}
        <Formik
          initialValues={{ slug: '' }}
          validateOnChange={true}
          validationSchema={validation}
          onSubmit={async ({ slug }, { setSubmitting }) => {
            setSubmitting(true);
            await newTenant({ slug, user_id });
            setSubmitting(false);
          }}>
          {({ isSubmitting }) => (
            <Form>
              <Field
                disabled={val.data}
                className={classes.textField}
                label="Short memorable name"
                size="small"
                component={LowerCaseTextField}
                name={'slug'}
                placeholder={'issuer'}
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
                  disabled={isSubmitting || !!val.data}
                  type="submit">
                  Submit
                </Button>
              </p>
            </Form>
          )}
        </Formik>
        <Divider />
        {val.data && !val.loading && (
          <>
            <br />
            <Typography variant="h6" color="secondary">
              Tenant is successfully created.
            </Typography>
            <br />
            <JSONTree theme="bright" data={val.data} />
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

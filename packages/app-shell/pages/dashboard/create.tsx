import Button from '@material-ui/core/Button';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import LowerCaseTextField from 'components/LowerCaseTextField';
import Main from 'components/Main';
import Result from 'components/Result';
import { Form, Field, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { useFetcher } from 'utils';
import * as yup from 'yup';
import type { PartialTenant } from '../../types';

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

const TenantCreatePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { val, poster } = useFetcher<PartialTenant>();
  const user_id = (session as any)?.user?.id;
  const newTenant = (body: { slug: string; user_id: string }) => poster('/api/tenants', body);

  return (
    <Layout title="Tenant">
      <Main
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard"
        title="Create Tenant"
        subtitle="Each tenant does .... Learn more."
        isLoading={val.loading}>
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
                disabled={!!val.data}
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
        <Result isTenantExist={true} result={val} />
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default TenantCreatePage;

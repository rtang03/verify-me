import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import LowerCaseTextField from 'components/LowerCaseTextField';
import Main from 'components/Main';
import ProTip from 'components/ProTip';
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
    submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
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
          {({ values, isSubmitting }) => (
            <Form>
              <Card>
                <CardContent>
                  <ProTip text="Tenant's name must be globally unique, and in lowercase." />
                </CardContent>
                <CardContent>
                  <Field
                    disabled={!!val.data}
                    className={classes.textField}
                    label="Short memorable name"
                    size="small"
                    component={LowerCaseTextField}
                    name={'slug'}
                    placeholder={'verifier'}
                    variant="outlined"
                    margin="normal"
                    fullwidth="true"
                    autoFocus={true}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    className={classes.submit}
                    variant="outlined"
                    color="inherit"
                    size="large"
                    disabled={isSubmitting || !!val.data || !values.slug}
                    type="submit">
                    Submit
                  </Button>
                </CardActions>
                <Result isTenantExist={true} result={val} />
              </Card>
            </Form>
          )}
        </Formik>
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default TenantCreatePage;

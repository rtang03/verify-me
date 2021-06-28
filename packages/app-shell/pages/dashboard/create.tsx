import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/ExitToApp';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import LowerCaseTextField from 'components/LowerCaseTextField';
import Main from 'components/Main';
import ProTip from 'components/ProTip';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { useEffect } from 'react';
import type { PartialTenant } from 'types';
import { useFetcher, useLocalStorage } from 'utils';
import * as yup from 'yup';

const validation = yup.object({
  slug: yup
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(20, 'Must be less  than 20 characters')
    .required('tenant name is required')
    .matches(/^[a-zA-Z0-9]+$/, 'Cannot contain special characters or spaces'),
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '40ch' },
  })
);

const TenantCreatePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { val, poster } = useFetcher<PartialTenant>();
  const user_id = (session as any)?.user?.id;
  const newTenant = (body: { slug: string; user_id: string }) => poster('/api/tenants', body);

  // used for "Set Active"
  const { toggleStorage, setToggleStorage } = useLocalStorage();
  useEffect(() => {
    setToggleStorage((val) => !val);
  }, [session, val?.data]);

  return (
    <Layout title="Tenant" refresh={toggleStorage}>
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
          {({ values, isSubmitting, submitForm }) => (
            <Form>
              <Card className={classes.root}>
                <CardContent className={classes.root}>
                  <ProTip text="Tenant's name must be globally unique, and cannot be changed." />
                  <br />
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
                  <SubmitButton
                    tooltip="Create tenant"
                    text={<PlusOneIcon />}
                    submitForm={submitForm}
                    loading={isSubmitting}
                    success={!!val?.data}
                    error={!!val?.error}
                    disabled={isSubmitting || !!val.data || !values.slug}
                  />
                </CardActions>
                {val && <Result isTenantExist={true} result={val} />}
                {val?.data && (
                  <CardContent>
                    <Typography variant="body2">
                      <>
                        <Link href={`/dashboard/${val.data.id}`}>
                          <a>
                            <IconButton>
                              <LinkIcon />
                            </IconButton>
                          </a>
                        </Link>
                        {val.data.slug}
                      </>
                    </Typography>
                  </CardContent>
                )}
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

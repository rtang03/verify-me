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
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';
import * as yup from 'yup';

const validation = yup.object({
  serviceEndpoint: yup.string().url().required('url is required'),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
    submit: { margin: theme.spacing(3, 0, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { val, fetcher } = useFetcher<IIdentifier>();
  const { val: addServiceEP, fetcher: addServiceEPFetcher } = useFetcher<{ success: boolean }>();
  const isMessagingExist = () =>
    val.data?.services
      ?.map(({ type }) => type === 'Messaging')
      .reduce((prev, curr) => prev || curr, false);

  useEffect(() => {
    fetcher(`/api/users/${router.query.id}`).finally(() => true);
  }, [session]);

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
          <Typography variant="h4">User Identifier</Typography>
          <br />
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          <Divider />
          {val.data && (
            <>
              <Typography variant="h5">Current document</Typography>
              <JSONTree theme="bright" data={val.data} hideRoot={true} />
              <div hidden={isMessagingExist()}>
                <Divider variant="inset" />
                <Typography variant="h6">Add messaging endpoint</Typography>
                <Formik
                  initialValues={{ type: 'Messaging', serviceEndpoint: '' }}
                  validateOnChange={true}
                  validationSchema={validation}
                  onSubmit={async ({ type, serviceEndpoint }, { setSubmitting }) => {
                    setSubmitting(true);
                    const numberOfServiceEndpoint = val.data?.services?.length ?? 0;
                    const id = `service#${numberOfServiceEndpoint + 1}`;
                    console.log(id);
                    await addServiceEPFetcher(`/api/users/${router.query.id}/services`, {
                      method: 'POST',
                      headers: { 'Content-type': 'application/json' },
                      body: JSON.stringify({ serviceEndpoint, type, id }),
                    }).finally(() => setSubmitting(false));
                  }}>
                  {({ values: { serviceEndpoint }, isSubmitting, errors }) => (
                    <Form>
                      <Field
                        disabled={true}
                        className={classes.typeTextField}
                        label="Type"
                        size="small"
                        component={TextField}
                        name={'type'}
                        placeholder={'Messaging'}
                        variant="outlined"
                        margin="normal"
                        fullwidth="20%"
                      />{' '}
                      <Field
                        disabled={addServiceEP.data}
                        className={classes.serviceTextField}
                        label="Service endpoint"
                        size="small"
                        component={TextField}
                        name={'serviceEndpoint'}
                        placeholder={'e.g. http://example.com'}
                        variant="outlined"
                        margin="normal"
                        fullwidth="50%"
                        autoFocus={true}
                      />
                      <div>
                        <Button
                          className={classes.submit}
                          variant="contained"
                          color="primary"
                          size="small"
                          type="submit"
                          disabled={
                            isSubmitting ||
                            !!errors?.serviceEndpoint ||
                            !serviceEndpoint ||
                            !!addServiceEP?.data
                          }>
                          Add
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
                <Typography variant="caption" color="secondary">
                  {addServiceEP?.data?.success && 'Service endpoint added'}
                </Typography>
              </div>
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

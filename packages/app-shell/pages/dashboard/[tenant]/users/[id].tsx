import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import type { IIdentifier, IDIDManagerAddServiceArgs } from '@veramo/core';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Identifier from 'components/Identifier';
import Layout from 'components/Layout';
import Main from 'components/Main';
import ProTip from 'components/ProTip';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import { mutate } from 'swr';
import { getTenantUrl, useFetcher, useReSWR, useTenant } from 'utils';
import * as yup from 'yup';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const secure = process.env.NEXT_PUBLIC_DOMAIN_SECURE === 'true';
const validation = yup.object({
  serviceEndpoint: yup.string().url().required('url is required'),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      flexWrap: 'wrap',
    },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
    submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
  })
);

const UsersEditPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query IIdentifier
  const id = router.query.id as string; // this is "IIdentifier.alias"
  const url = slug ? `/api/users/${id}?slug=${slug}&id={id}` : null;
  const { data, isLoading, isError, error } = useReSWR<IIdentifier>(url, !!slug);
  const isMessagingExist = data?.services
    ?.map(({ type }) => type === 'Messaging')
    .reduce((prev, curr) => prev || curr, false);

  // Add new service endpoint
  const { val: addServiceEP, poster } = useFetcher<{ success: boolean }>();
  const newService = (body: IDIDManagerAddServiceArgs) =>
    mutate(url, poster(`/api/users/${router.query.id}/services?slug=${slug}`, body));
  const serviceEndpoint = (slug && domain && `${getTenantUrl(slug, domain, secure)}`) || '';

  return (
    <Layout title="User">
      <Main
        session={session}
        title="User Identifier"
        parentUrl={`/dashboard/${tenantInfo?.id}/users`}
        parentText="User-Identifiers"
        isLoading={tenantLoading || isLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && data && (
          <Card>
            <CardHeader
              avatar={<AvatarMd5 subject={data.alias || 'idle'} />}
              title="Active User"
              subheader={data.did}
            />
            <CardContent>
              <Formik
                initialValues={{ type: 'Messaging', serviceEndpoint }}
                validateOnChange={true}
                validationSchema={validation}
                onSubmit={async ({ type, serviceEndpoint }, { setSubmitting }) => {
                  setSubmitting(true);
                  const numberOfServiceEndpoint = data?.services?.length ?? 0;
                  const id = `service#${numberOfServiceEndpoint + 1}`;
                  await newService({
                    did: data.did,
                    // provider: 'web',
                    service: { id, type, serviceEndpoint, description: '' },
                  }).then(() => setSubmitting(false));
                }}>
                {({ values: { serviceEndpoint }, isSubmitting, submitForm, errors }) => (
                  <Form>
                    <Card variant="outlined" className={classes.root}>
                      <CardContent>
                        <Identifier identifier={data} />
                      </CardContent>
                      {!isMessagingExist && (
                        <CardContent>
                          <Card variant="outlined">
                            <CardContent>
                              <ProTip text="A service is required to send / receive message." />
                            </CardContent>
                            <CardHeader subheader="Add Messaging Service" />
                            <CardContent>
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
                                disabled={!!addServiceEP.data}
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
                            </CardContent>
                            <CardActions>
                              <Button
                                className={classes.submit}
                                variant="outlined"
                                color="inherit"
                                type="submit"
                                size="large"
                                disabled={
                                  isSubmitting ||
                                  !!errors?.serviceEndpoint ||
                                  !serviceEndpoint ||
                                  !!addServiceEP?.data
                                }>
                                + Service
                              </Button>
                              <SubmitButton
                                success={!!addServiceEP?.data}
                                error={!!addServiceEP?.error}
                                submitForm={submitForm}
                                loading={isSubmitting}
                                disabled={
                                  isSubmitting ||
                                  !!errors?.serviceEndpoint ||
                                  !serviceEndpoint ||
                                  !!addServiceEP?.data
                                }
                                text="+ Service"
                              />
                            </CardActions>
                          </Card>
                        </CardContent>
                      )}
                      <Result isTenantExist={!!tenantInfo} result={addServiceEP} />
                    </Card>
                  </Form>
                )}
              </Formik>
            </CardContent>
            <RawContent title="Raw User Identifier" content={data} />
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default UsersEditPage;

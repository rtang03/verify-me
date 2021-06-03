import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import type { IIdentifier, IDIDManagerAddServiceArgs } from '@veramo/core';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
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
      display: 'flex',
      flexWrap: 'wrap',
    },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
    submit: { margin: theme.spacing(3, 3, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
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
        isError={tenantError && !tenantLoading}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
        {tenantInfo?.activated && data && (
          <Card>
            <CardHeader
              avatar={<AvatarMd5 subject={data.alias || 'idle'} />}
              title="Active document"
              subheader={data.did}
            />
            <CardContent>
              <Divider />
              <JSONTree data={data} hideRoot={true} />
            </CardContent>
            <CardContent>
              {!isMessagingExist && (
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
                  {({ values: { serviceEndpoint }, isSubmitting, errors }) => (
                    <Form>
                      <Card>
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
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={
                              isSubmitting ||
                              !!errors?.serviceEndpoint ||
                              !serviceEndpoint ||
                              !!addServiceEP?.data
                            }>
                            Add Service
                          </Button>
                        </CardActions>
                        <Result isTenantExist={!!tenantInfo} result={addServiceEP} />
                      </Card>
                    </Form>
                  )}
                </Formik>
              )}
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

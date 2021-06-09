import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import LanguageIcon from '@material-ui/icons/Language';
import type { IDIDManagerAddServiceArgs } from '@veramo/core';
import { DidDocument } from '@verify/server';
import { withAuth } from 'components';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import ServiceEndpoint from 'components/ServiceEndpoint';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { mutate } from 'swr';
import { getTenantUrl, useFetcher, useReSWR, useTenant } from 'utils';
import * as yup from 'yup';
import { grey } from '@material-ui/core/colors';

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
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const IdentifiersServicePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query Web Did
  const url = slug ? `/api/identifiers/did-json?slug=${slug}` : null;
  const { data, isLoading, error: didError } = useReSWR<DidDocument>(url, !!slug);
  const service = data?.service;

  // Add new service endpoint
  const { val: addServiceEP, poster } = useFetcher<{ success: boolean }>();
  const newService = (body: IDIDManagerAddServiceArgs) =>
    mutate(url, poster(`/api/identifiers/service?slug=${slug}`, body));
  const serviceEndpoint = (slug && domain && `${getTenantUrl(slug, domain, secure)}`) || '';

  return (
    <Layout title="Identifier">
      <Main
        session={session}
        title="Identifier"
        subtitle={tenantInfo?.slug?.toUpperCase()}
        parentUrl={`/dashboard/${tenantInfo?.id}/identifiers`}
        parentText="Did Document"
        isLoading={tenantLoading || isLoading}
        isError={tenantError || didError}>
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        {tenantInfo?.activated && service && !isLoading && !didError && (
          <Card>
            {!!service?.length && (
              <>
                <CardHeader
                  avatar={
                    <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
                      <LanguageIcon />
                    </Avatar>
                  }
                  title="Service endpoint"
                  subheader="Used for Did-Comm Messaging"
                />
                <CardContent>
                  {service.map(({ id, type, serviceEndpoint }, index) => (
                    <ServiceEndpoint key={index} id={id} type={type} url={serviceEndpoint} />
                  ))}
                </CardContent>
              </>
            )}
            {service?.length === 0 && data && (
              <Formik
                initialValues={{ type: 'Messaging', serviceEndpoint }}
                validateOnChange={true}
                validationSchema={validation}
                onSubmit={async ({ type, serviceEndpoint }, { setSubmitting }) => {
                  setSubmitting(true);
                  const numberOfServiceEndpoint = data?.service?.length ?? 0;
                  const id = `service#${numberOfServiceEndpoint + 1}`;
                  await newService({
                    did: data.id,
                    // provider: 'web',
                    service: { id, type, serviceEndpoint, description: '' },
                  }).then(() => setSubmitting(false));
                }}>
                {({ isSubmitting }) => (
                  <Form>
                    <CardHeader
                      avatar={
                        <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
                          <LanguageIcon />
                        </Avatar>
                      }
                      title="Add Service Endpoint"
                      subheader="Used for Did-Comm Messaging"
                    />
                    <CardContent>
                      {' '}
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
                        size="large"
                        type="submit"
                        disabled={isSubmitting}>
                        Add
                      </Button>
                    </CardActions>
                    <RawContent title="Raw Did Document" content={data} />
                  </Form>
                )}
              </Formik>
            )}
            <Result isTenantExist={!!tenantInfo} result={addServiceEP} />
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersServicePage;

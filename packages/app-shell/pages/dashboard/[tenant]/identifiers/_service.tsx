import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import type { DidDocument, IDIDManagerRemoveServiceArgs } from '@verify/server';
import { withAuth } from 'components';
import AddServiceEndpoint from 'components/AddServiceEndpoint';
import ConfirmationDialog from 'components/ConfirmationDialog';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import ServiceEndpoint from 'components/ServiceEndpoint';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { mutate } from 'swr';
import { useFetcher, useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
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
  const { data: didDoc, isLoading, error: didError } = useReSWR<DidDocument>(url, !!slug);
  const services = didDoc?.service;

  // delete service endpoint
  const { val: removeServiceEP, poster: remove } = useFetcher<{ success: boolean }>();
  const removeService = (body: IDIDManagerRemoveServiceArgs) =>
    mutate(url, remove(`/api/tenants/didManagerRemoveService?slug=${slug}`, body));

  // form state
  const [openConfirm, setConfirmOpen] = React.useState(false);
  const handleConfirmOpen = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);

  return (
    <Layout title="DID Document">
      <Main
        session={session}
        title="DID Document"
        subtitle={tenantInfo?.slug?.toUpperCase()}
        parentUrl={`/dashboard/${tenantInfo?.id}/identifiers`}
        parentText="Did Document"
        isLoading={tenantLoading || isLoading}
        isError={tenantError || didError}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && didDoc && services && !isLoading && !didError && (
          <Card className={classes.root}>
            {/*** Remove Service Endpoint ***/}
            {!!services?.length &&
            services.map((service, index) => (
              <Formik
                key={index}
                initialValues={{}}
                onSubmit={async (_, { setSubmitting }) => {
                  setSubmitting(true);
                  await removeService({ did: didDoc.id, id: service.id });
                  handleConfirmClose();
                  setSubmitting(false);
                }}>
                {({ isSubmitting, submitForm }) => (
                  <Form>
                    <CardHeader
                      className={classes.root}
                      avatar={
                        <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
                          <LanguageIcon />
                        </Avatar>
                      }
                      title="Service endpoint"
                      subheader="Used for Did-Comm Messaging"
                      action={
                        <IconButton onClick={handleConfirmOpen}>
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      }
                    />
                    <ConfirmationDialog
                      open={openConfirm}
                      handleClose={handleConfirmClose}
                      title="Confirm to delete?"
                      content="After deletion, messages will no longer be sent / received."
                      submitForm={submitForm}
                      confirmDisabled={isSubmitting}
                      loading={isSubmitting}
                    />
                    <CardContent>
                      {services.map(({ id, type, serviceEndpoint }, index) => (
                        <ServiceEndpoint key={index} id={id} type={type} url={serviceEndpoint} />
                      ))}
                    </CardContent>
                    <Result isTenantExist={!!tenantInfo} result={removeServiceEP} />
                  </Form>
                )}
              </Formik>
            ))}
            {/*** Add Service Endpoint ***/}
            {services?.length === 0 && didDoc && (
              <AddServiceEndpoint tenantInfo={tenantInfo} did={didDoc.id} url={url} />
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersServicePage;

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import type {
  DidDocument,
  IDIDManagerAddServiceArgs,
  IDIDManagerRemoveServiceArgs,
} from '@verify/server';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import ProTip from 'components/ProTip';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import ServiceEndpoint from 'components/ServiceEndpoint';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { mutate } from 'swr';
import { getTenantUrl, useFetcher, useReSWR, useTenant } from 'utils';
import * as yup from 'yup';
import AddServiceEndpoint from '../../../../components/AddServiceEndpoint';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const secure = process.env.NEXT_PUBLIC_DOMAIN_SECURE === 'true';
const validation = yup.object({
  serviceEndpoint: yup.string().url().required('url is required'),
  description: yup.string(),
});
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

  // Add new service endpoint
  // const { val: addServiceEP, poster: add } = useFetcher<{ success: boolean }>();
  // const newService = (body: IDIDManagerAddServiceArgs) =>
  //   mutate(url, add(`/api/tenants/didManagerAddService?slug=${slug}`, body));
  // const defaultService = (slug && domain && `${getTenantUrl(slug, domain, secure)}`) || '';

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
                      <Dialog open={openConfirm} onClose={handleConfirmClose}>
                        <DialogTitle>Confirm to delete?</DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-description">
                            After deletion, messages will no longer be sent / received.
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            onClick={handleConfirmClose}
                            size="small"
                            variant="outlined"
                            color="inherit">
                            Disagree
                          </Button>
                          <Button
                            onClick={submitForm}
                            disabled={isSubmitting}
                            size="small"
                            variant="outlined"
                            color="inherit"
                            autoFocus>
                            Agree
                          </Button>
                        </DialogActions>
                      </Dialog>
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
              // <Formik
              //   initialValues={{
              //     type: 'Messaging',
              //     description: '',
              //     serviceEndpoint: defaultService,
              //   }}
              //   validateOnChange={true}
              //   validationSchema={validation}
              //   onSubmit={async ({ type, serviceEndpoint, description }, { setSubmitting }) => {
              //     setSubmitting(true);
              //     const id = `service#${didDoc.id}`;
              //     await newService({
              //       did: didDoc.id,
              //       // provider: 'web',
              //       service: { id, type, serviceEndpoint, description },
              //     }).then(() => setSubmitting(false));
              //   }}>
              //   {({ isSubmitting, submitForm }) => (
              //     <Form>
              //       <CardContent>
              //         <ProTip text="No service endpoint found. Please do create one." />
              //       </CardContent>
              //       <CardHeader
              //         avatar={
              //           <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
              //             <LanguageIcon />
              //           </Avatar>
              //         }
              //         title="Add Service Endpoint"
              //         subheader="Used for Did-Comm Messaging"
              //       />
              //       <CardContent>
              //         <Field
              //           disabled={true}
              //           className={classes.typeTextField}
              //           label="Type"
              //           size="small"
              //           component={TextField}
              //           name={'type'}
              //           placeholder={'Messaging'}
              //           variant="outlined"
              //           margin="normal"
              //         />
              //         <br />
              //         <Field
              //           disabled={!!addServiceEP.data}
              //           className={classes.serviceTextField}
              //           label="Service endpoint *"
              //           size="small"
              //           component={TextField}
              //           name={'serviceEndpoint'}
              //           placeholder={'e.g. http://example.com'}
              //           variant="outlined"
              //           margin="normal"
              //           autoFocus={true}
              //         />
              //         <br />
              //         <Field
              //           disabled={!!addServiceEP.data}
              //           className={classes.serviceTextField}
              //           label="Description"
              //           size="small"
              //           component={TextField}
              //           name={'description'}
              //           placeholder={'Messaging Endpoint'}
              //           variant="outlined"
              //           margin="normal"
              //           autoFocus={true}
              //         />
              //       </CardContent>
              //       <CardActions>
              //         <SubmitButton
              //           text="+ Service"
              //           submitForm={submitForm}
              //           disabled={isSubmitting}
              //           loading={isSubmitting}
              //           success={!!addServiceEP?.data}
              //         />
              //       </CardActions>
              //       <RawContent title="Raw Did Document" content={didDoc} />
              //       <Result isTenantExist={!!tenantInfo} result={addServiceEP} />
              //     </Form>
              //   )}
              // </Formik>
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersServicePage;

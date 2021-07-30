import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import type {
  DidDocument,
  IKey,
  IDIDManagerAddKeyArgs,
  IKeyManagerCreateArgs,
} from '@verify/server';
import { withAuth } from 'components';
import AddServiceEndpoint from 'components/AddServiceEndpoint';
import AvatarMd5 from 'components/AvatarMd5';
import ConfirmationDialog from 'components/ConfirmationDialog';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import RawContent from 'components/RawContent';
import RemoveServiceEndpoint from 'components/RemoveServiceEndpoint';
import Result from 'components/Result';
import ServiceEndpoint from 'components/ServiceEndpoint';
import SubmitButton from 'components/SubmitButton';
import VerificationMethod from 'components/VerificationMethod';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { mutate } from 'swr';
import { useFetcher, useNextAuthUser, useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const IdentifiersServicePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Web Did
  const url = slug ? `/api/identifiers/did-json?slug=${slug}` : null;
  const { data: didDoc, isLoading, error: didError } = useReSWR<DidDocument>(url, !!slug);
  const services = didDoc?.service;

  // form state - open AddKey Dialogue
  const [openAddKey, setAddKeyOpen] = React.useState(false);
  const handleOpenAddKey = () => setAddKeyOpen(true);
  const handleCloseAddKey = () => setAddKeyOpen(false);

  // Add Secp256k1 key
  const {
    val: createSecp256k1Result,
    setVal: setValAddKey,
    poster: _createKey,
  } = useFetcher<IKey>();
  const { val: addSecp256k1Result, poster: _addKey } = useFetcher<{ success: boolean }>();
  const addKey = async (body: IDIDManagerAddKeyArgs) =>
    _addKey(`/api/tenants/didManagerAddKey?slug=${slug}`, body);
  const createKey = async (body: IKeyManagerCreateArgs) => {
    await _createKey(`/api/tenants/keyManagerCreate?slug=${slug}`, body);
    await mutate(url);
  };

  return (
    <Layout title="DID Document" shouldShow={[show, setShow]} user={activeUser}>
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
            <CardHeader
              className={classes.root}
              avatar={<AvatarMd5 subject={didDoc.id || 'idle'} />}
              title={didDoc.id}
            />
            {show && didDoc && <RawContent title="Raw Did Document" content={didDoc} />}
            {/* Verification Method */}
            <CardContent>
              <Card variant="outlined" className={classes.root}>
                <CardHeader
                  className={classes.root}
                  title="Verification Method"
                  action={
                    createSecp256k1Result?.data ? (
                      <React.Fragment />
                    ) : (
                      <Tooltip key="2" title="Create Secp2561 key">
                        <IconButton onClick={handleOpenAddKey}>
                          <VpnKeyOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                />
                <Formik
                  initialValues={{}}
                  onSubmit={async (_, { setSubmitting }) => {
                    setSubmitting(true);
                    await createKey({ kms: 'local', type: 'Secp256k1' });
                    handleCloseAddKey();
                    setSubmitting(false);
                  }}>
                  {({ isSubmitting, submitForm }) => (
                    <Form>
                      <ConfirmationDialog
                        open={openAddKey}
                        handleClose={handleCloseAddKey}
                        title="Add a key"
                        content="Add a Secp256k1 Key. This key is used to create Selective Disclosure Request."
                        submitForm={submitForm}
                        confirmDisabled={isSubmitting}
                        loading={isSubmitting}
                      />
                      {createSecp256k1Result?.error && (
                        <Error error={createSecp256k1Result.error} />
                      )}
                    </Form>
                  )}
                </Formik>
                {/* Add New Key */}
                {createSecp256k1Result?.data && (
                  <CardContent>
                    <Card variant="outlined" className={classes.root}>
                      {/* can dismiss when add-key successfully */}
                      {addSecp256k1Result?.data && (
                        <CardHeader
                          action={
                            <IconButton
                              onClick={() =>
                                setValAddKey({
                                  data: null,
                                  error: null,
                                  loading: false,
                                })
                              }>
                              <CloseOutlinedIcon />
                            </IconButton>
                          }
                        />
                      )}
                      <RawContent title="New Key Available" content={createSecp256k1Result.data} />
                      <CardActions>
                        <Formik
                          initialValues={{}}
                          onSubmit={async (_, { setSubmitting }) => {
                            setSubmitting(true);
                            await addKey({
                              did: didDoc.id,
                              key: createSecp256k1Result.data as any,
                            });
                            setSubmitting(false);
                          }}>
                          {({ isSubmitting, submitForm }) => (
                            <Form>
                              <SubmitButton
                                tooltip="Add key"
                                submitForm={submitForm}
                                text="Add Key"
                                loading={isSubmitting}
                                success={!!addSecp256k1Result?.data}
                                error={!!addSecp256k1Result?.error}
                                disabled={isSubmitting || !!addSecp256k1Result?.data}
                              />
                            </Form>
                          )}
                        </Formik>
                      </CardActions>
                      <Result isTenantExist={!!tenantInfo} result={addSecp256k1Result} />
                      {show && addSecp256k1Result && (
                        <RawContent title="Raw add-key result" content={addSecp256k1Result} />
                      )}
                    </Card>
                  </CardContent>
                )}
                <CardContent>
                  <VerificationMethod methods={didDoc.verificationMethod} />
                </CardContent>
              </Card>
            </CardContent>
            {/*** Remove Service Endpoint ***/}
            {services?.length > 0 && (
              <CardContent>
                <Card variant="outlined" className={classes.root}>
                  {services.map((service, index) => (
                    <RemoveServiceEndpoint
                      key={index}
                      service={service}
                      did={didDoc.id}
                      url={url}
                      tenantInfo={tenantInfo}
                    />
                  ))}
                  <CardContent>
                    {services.map(({ id, type, serviceEndpoint }, index) => (
                      <ServiceEndpoint key={index} id={id} type={type} url={serviceEndpoint} />
                    ))}
                  </CardContent>
                </Card>
              </CardContent>
            )}
            {/*** Add Service Endpoint ***/}
            {services?.length === 0 && didDoc && (
              <CardContent>
                <Card variant="outlined" className={classes.root}>
                  <AddServiceEndpoint
                    showRawContent={show}
                    tenantInfo={tenantInfo}
                    did={didDoc.id}
                    url={url}
                  />
                </Card>
              </CardContent>
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersServicePage;

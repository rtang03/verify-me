import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import type {
  IIdentifier,
  IDIDManagerAddKeyArgs,
  IKey,
  IKeyManagerCreateArgs,
} from '@verify/server';
import { withAuth } from 'components';
import AddServiceEndpoint from 'components/AddServiceEndpoint';
import AvatarMd5 from 'components/AvatarMd5';
import ConfirmationDialog from 'components/ConfirmationDialog';
import DeleteIdentifier from 'components/DeleteIdentifier';
import DropdownMenu from 'components/DropdownMenu';
import Error from 'components/Error';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import Identifier from 'components/Identifier';
import Layout from 'components/Layout';
import Main from 'components/Main';
import RawContent from 'components/RawContent';
import RemoveServiceEndpoint from 'components/RemoveServiceEndpoint';
import Result from 'components/Result';
import ServiceEndpoint from 'components/ServiceEndpoint';
import SubmitButton from 'components/SubmitButton';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { mutate } from 'swr';
import { useFetcher, useNextAuthUser, useReSWR, useTenant } from 'utils';

const DID_METHOD = 'did:web';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
    submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
  })
);

const UsersEditPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query IIdentifier
  const id = router.query.id as string; // this is "IIdentifier.alias"
  const url = slug ? `/api/users/${id}?slug=${slug}&id={id}` : null;
  const { data, isLoading, isError, error } = useReSWR<IIdentifier>(url, !!slug);
  // see https://github.com/uport-project/veramo/blob/next/packages/remote-server/src/default-did.ts
  const isMessagingExist = data?.services
    ?.map(({ type }) => type === 'DIDCommMessaging')
    .reduce((prev, curr) => prev || curr, false);
  const services = data?.services;

  // form state - helpDialog
  const [openHelp, setHelpOpen] = React.useState(false);
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  // form state - menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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

  // form state - open AddKey Dialogue
  const [openAddKey, setAddKeyOpen] = React.useState(false);
  const handleOpenAddKey = () => setAddKeyOpen(true);
  const handleCloseAddKey = () => setAddKeyOpen(false);

  return (
    <Layout title="User" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={1}>
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
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={<AvatarMd5 subject={data.did || 'idle'} />}
              title={data.did}
              action={
                <IconButton onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            {/* Add new key */}
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
                  <DropdownMenu
                    anchorEl={anchorEl}
                    handleClick={handleMenuClick}
                    handleClose={handleMenuClose}
                    iconButtons={[
                      <Tooltip key="1" title="Help">
                        <IconButton onClick={handleHelpOpen}>
                          <HelpOutlineOutlinedIcon />
                        </IconButton>
                      </Tooltip>,
                      createSecp256k1Result?.data ? (
                        <React.Fragment />
                      ) : (
                        <Tooltip key="2" title="Add Secp2561 key">
                          <IconButton onClick={handleOpenAddKey}>
                            <VpnKeyOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      ),
                    ]}
                  />
                  <ConfirmationDialog
                    open={openAddKey}
                    handleClose={handleCloseAddKey}
                    title="Add a key"
                    content="Add a Secp256k1 Key. This key is used to create Selective Disclosure Request."
                    submitForm={submitForm}
                    confirmDisabled={isSubmitting}
                    loading={isSubmitting}
                  />
                  {createSecp256k1Result?.error && <Error error={createSecp256k1Result.error} />}
                </Form>
              )}
            </Formik>
            <HelpDialog
              open={openHelp}
              handleClose={handleHelpClose}
              content={
                <GlossaryTerms
                  terms={[TERMS.did, TERMS.serviceEndpoint, TERMS.verificationMethod]}
                />
              }
            />
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
                  <Formik
                    initialValues={{}}
                    onSubmit={async (_, { setSubmitting }) => {
                      setSubmitting(true);
                      await addKey({
                        did: `${DID_METHOD}:${id}`,
                        key: createSecp256k1Result.data as any,
                      });
                      setSubmitting(false);
                    }}>
                    {({ isSubmitting, submitForm }) => (
                      <Form>
                        <CardActions>
                          <SubmitButton
                            tooltip="Add key"
                            submitForm={submitForm}
                            text="Add Key"
                            loading={isSubmitting}
                            success={!!addSecp256k1Result?.data}
                            error={!!addSecp256k1Result?.error}
                            disabled={isSubmitting || !!addSecp256k1Result?.data}
                          />
                        </CardActions>
                        <Result isTenantExist={!!tenantInfo} result={addSecp256k1Result} />
                        {show && addSecp256k1Result && (
                          <RawContent title="Raw add-key result" content={addSecp256k1Result} />
                        )}
                      </Form>
                    )}
                  </Formik>
                </Card>
              </CardContent>
            )}
            <CardContent>
              <Card variant="outlined" className={classes.root}>
                <CardHeader className={classes.root} title="About" />
                <CardContent className={classes.root}>
                  <Identifier identifier={data} />
                </CardContent>
                {show && <RawContent title="Raw User Identifier" content={data} />}
              </Card>
              {/*** Add Service Endpoint ***/}
              {!isMessagingExist && (
                <Card className={classes.root}>
                  <AddServiceEndpoint tenantInfo={tenantInfo} did={data.did} url={url} />
                </Card>
              )}
              {/*** Display Existing Service Endpoint ***/}
              {isMessagingExist && (
                <Card variant="outlined" className={classes.root}>
                  {/*** Remove Service Endpoint ***/}
                  {!!services?.length &&
                    data?.did &&
                    services.map((service, index) => (
                      <RemoveServiceEndpoint
                        key={index}
                        service={service}
                        did={data?.did}
                        url={url}
                        tenantInfo={tenantInfo}
                      />
                    ))}
                  {!!services?.length && (
                    <CardContent>
                      {services.map(({ id, type, serviceEndpoint }, index) => (
                        <ServiceEndpoint key={index} id={id} type={type} url={serviceEndpoint} />
                      ))}
                    </CardContent>
                  )}
                </Card>
              )}
            </CardContent>
            <CardContent className={classes.root}>
              <DeleteIdentifier tenantInfo={tenantInfo} did={data?.did} />
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default UsersEditPage;

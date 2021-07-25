import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import ReceiptOutlinedIcon from '@material-ui/icons/ReceiptOutlined';
import type { IIdentifier, IDIDManagerGetOrCreateArgs } from '@veramo/core';
import { DidDocument } from '@verify/server';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import DropdownMenu from 'components/DropdownMenu';
import Error from 'components/Error';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import Layout from 'components/Layout';
import Main from 'components/Main';
import ProTip from 'components/ProTip';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { mutate } from 'swr';
import { getTenantUrl, useFetcher, useReSWR, useTenant } from 'utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const IdentifiersIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const fqUrl = tenantInfo?.slug && domain && getTenantUrl(tenantInfo?.slug, domain);
  const nonFqUrl = fqUrl?.replace('https://', '').replace('http://', '');

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Web Did
  const url = slug ? `/api/identifiers/did-json?slug=${slug}` : null;
  const { data, isLoading, error: didError } = useReSWR<DidDocument>(url, !!slug);

  // Create Web Did
  const { val: webDid, poster } = useFetcher<IIdentifier>();
  const newDid = async (body: IDIDManagerGetOrCreateArgs) => {
    await poster(`/api/tenants/didManagerCreate?slug=${slug}`, body);
    await mutate(url);
  };

  // form state - helpDialog
  const [openHelp, setHelpOpen] = React.useState(false);
  const handleOpen = () => setHelpOpen(true);
  const handleClose = () => setHelpOpen(false);

  // form state - menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Layout title="Identifiers" shouldShow={[show, setShow]} user={session.user}>
      <Main
        session={session}
        title="Did Document"
        subtitle="Setup decentralized identity for web. Each tenant can have only one web did-document."
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || isLoading}
        isError={tenantError || didError}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && !data && !isLoading && !didError && (
          <Formik
            initialValues={{}}
            onSubmit={async (_, { setSubmitting }) => {
              setSubmitting(true);
              await newDid({ alias: nonFqUrl as string, options: { keyType: 'Ed25519' } }).then(
                () => setSubmitting(false)
              );
            }}>
            {({ isSubmitting, submitForm }) => (
              <Form>
                <Card className={classes.root}>
                  <CardHeader
                    className={classes.root}
                    title={`did:web:${nonFqUrl}`}
                    subheader={`Your web identifier`}
                  />
                  <CardContent className={classes.root}>
                    <ProTip text="No decentralized identity document found for this tenant. You are about to create one" />
                  </CardContent>
                  <CardActions>
                    <SubmitButton
                      tooltip="Create web DID document"
                      text={<PlusOneIcon />}
                      loading={isSubmitting}
                      submitForm={submitForm}
                      disabled={isSubmitting || !fqUrl || !!webDid?.data}
                      success={!!webDid?.data}
                      error={!!webDid?.error}
                    />
                  </CardActions>
                  <CardContent>
                    {webDid?.error && !webDid?.loading && <Error error={webDid?.error} />}
                    {show && (webDid?.error || webDid?.data) && !webDid?.loading && (
                      <RawContent title="Result" content={webDid} />
                    )}
                  </CardContent>
                </Card>
              </Form>
            )}
          </Formik>
        )}
        {tenantInfo?.activated && data?.id && (
          <>
            <QuickAction
              link={`/dashboard/${tenantInfo?.id}/identifiers/service`}
              label="Edit"
              disabled={!tenantInfo?.id}
              icon="edit"
            />
            <Card className={classes.root}>
              <CardHeader
                className={classes.root}
                avatar={
                  <CardHeaderAvatar>
                    <ReceiptOutlinedIcon />
                  </CardHeaderAvatar>
                }
                title="Did Document"
                subheader={<>Your URL: {fqUrl}</>}
                action={
                  <IconButton onClick={handleMenuClick}>
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <DropdownMenu
                anchorEl={anchorEl}
                handleClick={handleMenuClick}
                handleClose={handleMenuClose}
                iconButtons={[
                  <Tooltip key="1" title="Help">
                    <IconButton onClick={handleOpen}>
                      <HelpOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>,
                ]}
              />
              <HelpDialog
                open={openHelp}
                handleClose={handleClose}
                content={
                  <GlossaryTerms
                    terms={[TERMS.did, TERMS.serviceEndpoint, TERMS.verificationMethod]}
                  />
                }
              />
              <CardContent>
                <CardHeader title="DID" subheader={data?.id} />
                <CardHeader
                  title="Verification method"
                  subheader={`${data?.verificationMethod?.length} record(s) found`}
                />
                <CardHeader
                  title="Service endpoint"
                  subheader={
                    data?.service?.length === 0 ? (
                      <>No records found</>
                    ) : (
                      <>{`${data?.service?.length} record(s) found`}</>
                    )
                  }
                />
              </CardContent>
              {data?.service?.length === 0 && (
                <CardContent>
                  <CardContent>
                    <ProTip text="A service endpoint is required to send messages. You are about to create one." />
                  </CardContent>
                  <CardActions>
                    <QuickAction
                      label="Service"
                      link={`/dashboard/${tenantInfo.id}/identifiers/service`}
                      disabled={false}
                    />
                  </CardActions>
                </CardContent>
              )}
              <Result isTenantExist={!!tenantInfo} result={webDid} />
              {show && <RawContent title="Raw Did Document" content={data} />}
            </Card>
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersIndexPage;

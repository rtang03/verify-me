import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import type {
  IPresentationValidationResult,
  IValidatePresentationAgainstSdrArgs,
  IMessage,
  ISelectiveDisclosureRequest,
} from '@verify/server';
import { withAuth } from 'components';
import DropdownMenu from 'components/DropdownMenu';
import Error from 'components/Error';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageCard from 'components/MessageCard';
import ProTip from 'components/ProTip';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SelectiveDisclosureReq from 'components/SelectiveDisclosureReq';
import SubmitButton from 'components/SubmitButton';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { PaginatedMessage } from 'types';
import { discoverMessageType, useFetcher, useNextAuthUser, useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({ root: { margin: theme.spacing(3, 1, 2) } })
);

const MessagesDetailsPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Message
  const id = router.query.id as string; // hash
  const url = slug ? `/api/messages/${id}?slug=${slug}&id=${id}` : null;
  const { data, isLoading, isError, error } = useReSWR<IMessage>(url, !!slug);
  const isOutGoingMessage = data?.metaData?.[0]?.type !== 'DIDComm';
  const canValidate = !isOutGoingMessage && data?.type === 'w3c.vp';

  // Query Outgoing SDR, max 100 SDR
  const args = {
    where: [
      { column: 'type', op: 'Equal', value: ['sdr'] },
      { column: 'from', op: 'Equal', value: [data?.to] },
    ],
  };
  const shouldFetch = !!data && !!slug && !!tenantInfo?.activated;
  const fetchSdrUrl = slug
    ? `/api/messages?slug=${slug}&cursor=0&pagesize=100&args=${JSON.stringify(args)}`
    : null;
  const {
    data: sdrResult,
    isLoading: isSdrLoading,
    isError: isSdrError,
    error: sdrError,
  } = useReSWR<PaginatedMessage>(fetchSdrUrl, shouldFetch);
  const requests: [string, ISelectiveDisclosureRequest][] | undefined =
    sdrResult?.items && sdrResult?.items.length === 0
      ? []
      : sdrResult?.items.map((item) => [item.id, item.data as ISelectiveDisclosureRequest]);
  // END

  // Validate Presentation for SDR
  const { val: validateResult, poster } = useFetcher<IPresentationValidationResult>();
  const validate = (body: IValidatePresentationAgainstSdrArgs) =>
    poster(`/api/tenants/validatePresentationAgainstSdr?slug=${slug}`, body);
  // END

  // Message Types
  const {
    messageType,
    isVerifiablePresentation,
    isSelectiveDisclosureRequest,
    isVerifiiableCredential,
  } = discoverMessageType(data);

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
    <Layout title="Message" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={4}>
      <Main
        session={session}
        title="Message"
        parentText="Messages"
        parentUrl={`/dashboard/${tenantInfo?.id}/messages`}
        isLoading={tenantLoading || isLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && data && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              title={messageType}
              subheader={isOutGoingMessage ? 'Outgoing message' : 'Incoming message'}
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
              content={<GlossaryTerms terms={[TERMS.did]} />}
            />
            <CardContent>
              <MessageCard isFull={true} tenantInfo={tenantInfo} message={data} />
              {show && <RawContent title="Raw Message" content={data} />}
            </CardContent>
            {isVerifiiableCredential && (
              <CardContent>
                <QuickAction
                  icon="save"
                  label="Save"
                  link={`/dashboard/${tenantInfo?.id}/messages/${id}/savecredential`}
                  tooltip="Save Credential"
                  disabled={!tenantInfo?.id}
                />
              </CardContent>
            )}
            {isSelectiveDisclosureRequest && (
              <CardContent>
                <CardContent>
                  <QuickAction
                    label="Reply"
                    icon="send"
                    link={`/dashboard/${tenantInfo?.id}/messages/${id}/responsesdr`}
                    tooltip="Reply selective disclosure reqeust"
                    disabled={!tenantInfo?.id}
                  />
                </CardContent>
              </CardContent>
            )}
            {isVerifiablePresentation && (
              <CardContent>
                <CardContent>
                  <QuickAction
                    icon="save"
                    label="Save"
                    link={`/dashboard/${tenantInfo?.id}/messages/${id}/savepresentation`}
                    tooltip="Save Presentation"
                    disabled={!tenantInfo?.id}
                  />
                </CardContent>
              </CardContent>
            )}
            {canValidate && (
              <CardContent>
                <Card variant="outlined">
                  <CardHeader className={classes.root} title="Validate against below request(s)" />
                  {isSdrError && !isSdrLoading && <Error error={sdrError} />}
                  {!requests?.length && (
                    <ProTip text="No selective request meet the requirement " />
                  )}
                  {requests &&
                    requests?.length > 0 &&
                    requests.map((request, index) => (
                      <CardContent key={index}>
                        <Card variant="outlined">
                          <CardHeader
                            title={`Found request #${++index}`}
                            action={
                              <Link href={`/dashboard/${tenantInfo.id}/messages/${request[0]}`}>
                                <a>
                                  <Button size="small" color="inherit">
                                    <Typography variant="caption">Originating Message</Typography>
                                  </Button>
                                </a>
                              </Link>
                            }
                          />
                          {request[1] && (
                            <SelectiveDisclosureReq sdr={request[1]} hideHeader={true} />
                          )}
                          <Formik
                            initialValues={{}}
                            onSubmit={async (_, { setSubmitting }) => {
                              setSubmitting(true);
                              data?.presentations?.[0] &&
                                (await validate({
                                  presentation: data.presentations[0],
                                  sdr: request[1] as any,
                                }));
                              setSubmitting(false);
                            }}>
                            {({ isSubmitting, submitForm }) => (
                              <Form>
                                <SubmitButton
                                  tooltip="Validate presentation against Sdr"
                                  text="Validate"
                                  submitForm={submitForm}
                                  loading={isSubmitting}
                                  disabled={
                                    isSubmitting ||
                                    !!validateResult?.data ||
                                    !!validateResult?.error
                                  }
                                  success={!!validateResult?.data}
                                  error={!!validateResult?.error}
                                />
                              </Form>
                            )}
                          </Formik>
                          <Result isTenantExist={!!tenantInfo} result={validateResult} />
                          {validateResult?.data && (
                            <RawContent
                              title="Raw Validation result"
                              content={validateResult.data}
                            />
                          )}
                        </Card>
                      </CardContent>
                    ))}
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

export default MessagesDetailsPage;

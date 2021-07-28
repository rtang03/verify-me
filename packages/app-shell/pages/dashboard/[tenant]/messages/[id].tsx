import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type {
  IPresentationValidationResult,
  IValidatePresentationAgainstSdrArgs,
  IMessage,
  ISelectiveDisclosureRequest,
} from '@verify/server';
import { withAuth } from 'components';
import Error from 'components/Error';
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
import { useFetcher, useNextAuthUser, useReSWR, useTenant } from 'utils';

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
  const isOutGoingMessage = data?.metaData?.[0]?.type === 'DIDComm-sent';
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

  return (
    <Layout title="Message" shouldShow={[show, setShow]} user={activeUser}>
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
              subheader={isOutGoingMessage ? 'Outgoing message' : 'Incomming message'}
            />
            <CardContent>
              <MessageCard isFull={true} tenantInfo={tenantInfo} message={data} />
              {show && <RawContent title="Raw Message" content={data} />}
            </CardContent>
            {(data?.data as any)?.type?.[0] === 'VerifiableCredential' && (
              <CardContent>
                <QuickAction
                  link={`/dashboard/${tenantInfo?.id}/messages/${id}/saveCredential`}
                  label="Save Credential"
                  disabled={!tenantInfo?.id}
                />
              </CardContent>
            )}
            {/* TODO: BELOW CODE ARE NO LONGER VALID FOR RECEIVING CREDENTIAL; IT IS GOOD FOR SDR, NEED REVIEW */}
            {/*** SHOW RESPONSE BUTTON, if it is Incomming Message ***/}
            {data.type === 'sdr' && data?.metaData?.[0]?.type === 'DIDComm' && (
              <CardContent>
                <CardContent>
                  <QuickAction
                    link={`/dashboard/${tenantInfo?.id}/messages/${id}/response`}
                    label="RESPONSE"
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

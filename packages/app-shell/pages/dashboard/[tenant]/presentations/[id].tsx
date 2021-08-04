import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ScreenShareOutlinedIcon from '@material-ui/icons/ScreenShareOutlined';
import Pagination from '@material-ui/lab/Pagination';
import type {
  VerifiablePresentation,
  IValidatePresentationAgainstSdrArgs,
  IPresentationValidationResult,
  ISelectiveDisclosureRequest,
} from '@verify/server';
import { withAuth } from 'components';
import Switch from 'components/CustomSwitch';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Presentation from 'components/Presentation';
import ProTip from 'components/ProTip';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SelectiveDisclosureReq from 'components/SelectiveDisclosureReq';
import SubmitButton from 'components/SubmitButton';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  useFetcher,
  useNextAuthUser,
  usePagination,
  useQueryPaginatedMessage,
  useReSWR,
  useTenant,
} from 'utils';

const pattern = "d.M.yyyy HH:mm:ss 'GMT' XXX (z)";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const PresentationDetailsPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Presentation
  const id = router.query.id as string; // hash
  const url = slug ? `/api/presentations/${id}?slug=${slug}&id=${id}` : null;
  const { data: vp, isLoading, isError, error } = useReSWR<VerifiablePresentation>(url, !!slug);

  // Validate switch
  const [validateMode, setValidateMode] = useState(false);
  const handleValidateMode = ({ target }: React.ChangeEvent<HTMLInputElement>) =>
    setValidateMode(target.checked);

  // Query SDR
  const args = vp && {
    where: [
      { column: 'from', op: 'Equal', value: vp.verifier },
      { column: 'to', op: 'Equal', value: [vp.holder] },
      { column: 'type', op: 'Equal', value: ['sdr'] },
    ],
  };
  // should fetch corresponding sdr, after presentation is ready
  const shouldFetch = !!slug && !!tenantInfo?.activated && !!vp;
  const {
    count,
    isQueryMessageError,
    isQueryMessageLoading,
    paginatedMessage: paginatedSrdMessage,
    queryMessageError,
  } = useQueryPaginatedMessage({ slug, pageSize: 10, shouldFetch, args });

  // Validate against sdr
  const { val: validationResult, poster } = useFetcher<IPresentationValidationResult>();
  const validate = (body: IValidatePresentationAgainstSdrArgs) =>
    poster(`/api/tenants/validatePresentationAgainstSdr?slug=${slug}`, body);

  // canValidate
  const sdrs =
    paginatedSrdMessage?.items?.map((item) => item.data as ISelectiveDisclosureRequest) || [];
  const canValidate = vp?.type?.[0] === 'VerifiablePresentation' && validateMode && !!sdrs?.length;

  // Pagination
  const { cursor, pageChange } = usePagination(1);

  return (
    <Layout title="Presentation" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={3}>
      <Main
        session={session}
        title="Presentation"
        subtitle="Validate presentation against submmited selective disclosure request"
        parentText="Presentations"
        parentUrl={`/dashboard/${tenantInfo?.id}/presentations`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && vp && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              title={JSON.stringify(vp.type, null, 2)}
              subheader={format(new Date(vp.issuanceDate as any), pattern)}
              avatar={<ScreenShareOutlinedIcon />}
              action={
                <Switch
                  disabled={false}
                  name="Validate"
                  handleChange={handleValidateMode}
                  label={validateMode ? 'Validate on' : 'Validate off'}
                  state={validateMode}
                />
              }
            />
            <CardContent className={classes.root}>
              <Card variant="outlined">
                <Presentation vp={vp} id={id} />
                {show && <RawContent content={vp} title="Raw Presentation Details" />}
              </Card>
            </CardContent>
            {validateMode && (
              <CardContent className={classes.root}>
                <Card variant="outlined">
                  {isQueryMessageError && !isQueryMessageLoading && (
                    <Error error={queryMessageError} />
                  )}
                  {count && count > 0 && (
                    <>
                      <ProTip text="Selective disclosure request(s) found" />
                      <CardHeader className={classes.root} title="Select SDR to validate" />
                      {show && (
                        <RawContent content={paginatedSrdMessage} title="Raw Query-Sdr-message" />
                      )}
                      {paginatedSrdMessage?.items[cursor].data && (
                        <CardContent className={classes.root}>
                          <Card variant="outlined">
                            <Pagination
                              variant="outlined"
                              shape="rounded"
                              showFirstButton
                              showLastButton
                              onChange={pageChange}
                              disabled={!!validationResult?.data}
                              count={paginatedSrdMessage?.total || 0}
                            />
                            <SelectiveDisclosureReq sdr={paginatedSrdMessage.items[cursor].data} />
                          </Card>
                        </CardContent>
                      )}
                      <CardContent>
                        <Formik
                          initialValues={{}}
                          onSubmit={async (_, { setSubmitting }) => {
                            setSubmitting(true);
                            await validate({ presentation: vp, sdr: sdrs[cursor] });
                            setSubmitting(false);
                          }}>
                          {({ isSubmitting, submitForm }) => (
                            <Form>
                              <SubmitButton
                                text={'Validate'}
                                disabled={
                                  isSubmitting ||
                                  !!validationResult?.data ||
                                  !!validationResult?.error ||
                                  !canValidate
                                }
                                submitForm={submitForm}
                                loading={isLoading}
                                tooltip="Validate presentation against submitted SDR"
                                success={!!validationResult?.data}
                                error={!!validationResult?.error}
                              />
                              <Result isTenantExist={!!tenantInfo} result={validationResult} />
                              {validationResult?.data && (
                                <CardContent>
                                  <CardHeader
                                    title={`Presentation is ${
                                      validationResult.data.valid ? 'Valid' : 'Invalid'
                                    }`}
                                  />
                                  <RawContent
                                    title="Validation Result"
                                    content={validationResult.data}
                                  />
                                </CardContent>
                              )}
                            </Form>
                          )}
                        </Formik>
                      </CardContent>
                    </>
                  )}
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

export default PresentationDetailsPage;

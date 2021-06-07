import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type {
  IMessage,
  IGetVerifiableCredentialsForSdrArgs,
  ISelectiveDisclosureRequest,
  ICredentialsForSdr,
} from '@verify/server';
import { withAuth } from 'components';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import NoRecord from 'components/NoRecord';
import RawContent from 'components/RawContent';
import SelectiveDisclosureReq from 'components/SelectiveDisclosureReq';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { PaginatedIIdentifier } from 'types';
import { useFetcher, useReSWR, useSelectedCredentials, useTenant } from 'utils';
import * as yup from 'yup';

const PAGESIZE = 25;
const domain = process.env.NEXT_PUBLIC_DOMAIN;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexWrap: 'wrap', backgroundColor: theme.palette.background.paper },
    textField: { width: '40ch' },
    longTextField: { width: '60ch' },
    submit: { margin: theme.spacing(3, 3, 2) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: '50ch',
    },
    selectEmpty: { marginTop: theme.spacing(2) },
  })
);

const MessagesResponsePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query Message
  const id = router.query.id as string; // hash
  const url = slug ? `/api/messages/${id}?slug=${slug}&id=${id}` : null;
  const {
    data: message,
    isLoading: isMessageLoading,
    isError: isMessageError,
  } = useReSWR<IMessage>(url, !!slug);
  const sdr = message?.data as ISelectiveDisclosureRequest; // message.data is generic object

  // Query Identiifer
  const idsUrl = slug ? `/api/users?slug=${slug}&cursor=0&pagesize=${PAGESIZE}` : null;
  const {
    data: ids,
    isLoading: isIdsLoading,
    isError: isIdsError,
  } = useReSWR<PaginatedIIdentifier>(idsUrl, !!slug);

  // used by Select Component to filter Users by current slug
  const filteredIds = ids?.items.filter?.((id) => id?.alias?.includes(`${slug}.${domain}:users`));

  // getVerifiableCredentialsForSdr
  const { val: vc, poster } = useFetcher<ICredentialsForSdr>();
  const getVerifiableCredentialsForSdr = (body: IGetVerifiableCredentialsForSdrArgs) =>
    poster(`/api/requests/getVerifiableCredentialsForSdr`, body);

  // form state
  const [presenter, setPresenter] = useState<string>('');
  const handleSelectChange = ({ target: { value } }: React.ChangeEvent<{ value: unknown }>) =>
    setPresenter(value as string);

  const { selected, onSelect, valid } = useSelectedCredentials(vc.data);

  return (
    <Layout title="Response">
      <Main
        session={session}
        title="Selective Disclosure Response"
        subtitle="Create SD-Response"
        parentText={`Message`}
        parentUrl={`/dashboard/${tenantInfo?.id}/messages/${id}`}
        isLoading={tenantLoading || isMessageLoading || isIdsLoading}
        isError={
          (tenantError && !tenantLoading) ||
          (isMessageError && !isMessageLoading) ||
          (isIdsError && !isIdsLoading)
        }>
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        {tenantInfo?.activated && message?.data && message?.type !== 'sdr' && (
          <Typography variant="body2" color="secondary">
            Not SDR
          </Typography>
        )}
        {tenantInfo?.activated && message?.data && message?.type === 'sdr' && (
          <Card className={classes.root}>
            {message && (
              <MessageHeader
                from={message.from}
                to={message.to}
                createdAt={new Date(`${message.createdAt}`).toISOString()}
              />
            )}
            {sdr && <SelectiveDisclosureReq sdr={sdr} />}
            <RawContent title="Raw SDR" content={sdr} />
            <CardContent>
              <Formik
                initialValues={{}}
                onSubmit={async (_, { setSubmitting }) => {
                  setSubmitting(true);
                  await getVerifiableCredentialsForSdr({ sdr });
                  setSubmitting(false);
                }}>
                {({ isSubmitting }) => (
                  <Form>
                    <CardContent>
                      <Card variant="outlined">
                        <CardContent>
                          {filteredIds?.length && (
                            <FormControl required className={classes.formControl}>
                              <InputLabel id="presenter">Presenter</InputLabel>
                              <Select
                                labelId="select"
                                id="presenter"
                                value={presenter}
                                onChange={handleSelectChange}
                                className={classes.selectEmpty}>
                                {filteredIds.map((item, index) => (
                                  <MenuItem key={index} value={item.did}>
                                    {item.alias}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </CardContent>
                        {!filteredIds?.length && <NoRecord title="Presenter *" />}
                        <CardHeader subheader="Requested Claims" />
                        <CardContent>
                          {vc?.data && vc.data.credentials.map((claim, index) => <>d</>)}
                        </CardContent>
                      </Card>
                    </CardContent>
                    <CardActions>
                      <Button
                        disabled={isSubmitting || !sdr}
                        className={classes.submit}
                        variant="contained"
                        color="primary"
                        type="submit">
                        Get Verifiable Credential
                      </Button>
                    </CardActions>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default MessagesResponsePage;

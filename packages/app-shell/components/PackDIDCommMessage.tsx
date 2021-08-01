import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type {
  IDIDCommMessage,
  IPackDIDCommMessageArgs,
  IPackedDIDCommMessage,
} from '@verify/server';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import { v4 as uuidv4 } from 'uuid';
import RawContent from './RawContent';
import Result from './Result';
import SendFab from './SendFab';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    mail: { margin: theme.spacing(1, 5, 0) },
  })
);

const PackDIDCommMessage: React.FC<{
  tenantInfo: TenantInfo;
  from: string;
  to: string;
  body: any;
  messageId: string;
  setMessageId: (messageId: string) => void;
  setPackedMessage: (message: any) => void;
  show?: boolean;
}> = ({ tenantInfo, from, to, body, messageId, setMessageId, setPackedMessage, show }) => {
  const classes = useStyles();
  const { slug } = tenantInfo;

  // see example https://github.com/veramolabs/agent-explorer/blob/main/src/components/standard/CreateRequest.tsx
  // TODO: revisit later, if the body's payload, may require more metadata.
  const getPackDIDCommMessageArgs: () => IPackDIDCommMessageArgs = () => {
    const id = uuidv4();
    setMessageId(id);
    const message: IDIDCommMessage = {
      type: 'application/didcomm-encrypted+json',
      from,
      to,
      id,
      created_time: new Date().toISOString(),
      body,
    };
    return { message, packing: 'authcrypt' };
  };

  // Pack Message
  const { val, poster } = useFetcher<IPackedDIDCommMessage>();
  const packDIDCommMessage = (body: IPackDIDCommMessageArgs) =>
    poster(`/api/tenants/packDIDCommMessage?slug=${slug}`, body);

  val?.data && setPackedMessage(val.data);

  return (
    <>
      <CardContent className={classes.mail}>
        <Formik
          initialValues={{}}
          onSubmit={async (_, { setSubmitting }) => {
            setSubmitting(true);
            await packDIDCommMessage(getPackDIDCommMessageArgs());
            setSubmitting(false);
          }}>
          {({ isSubmitting, submitForm }) => (
            <Form>
              <SendFab
                tooltip="Pack"
                loading={isSubmitting}
                submitForm={submitForm}
                icon="pack"
                disabled={isSubmitting || !body || !!val?.data}
                success={!!val?.data}
                error={!!val?.error}
              />
            </Form>
          )}
        </Formik>
      </CardContent>
      <Result isTenantExist={!!tenantInfo} result={val} />
      {val?.data && (
        <CardContent>
          <Typography variant="caption">Message-Id: {messageId}</Typography>
        </CardContent>
      )}
      {show && val?.data && <RawContent content={val.data} title="Raw Packed Message" />}
    </>
  );
};
export default PackDIDCommMessage;

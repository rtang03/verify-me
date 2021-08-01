import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { ISendDIDCommMessageArgs, IPackedDIDCommMessage } from '@verify/server';
import { Form, Formik } from 'formik';
import React from 'react';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import MessageHeader from './MessageHeader';
import RawContent from './RawContent';
import Result from './Result';
import SendFab from './SendFab';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    mail: { margin: theme.spacing(1, 5, 0) },
  })
);

const SendDIDCommMessage: React.FC<{
  tenantInfo: TenantInfo;
  messageId: string;
  from: string;
  to: string;
  url: string;
  recipientDidUrl: string;
  packedMessage: IPackedDIDCommMessage;
  show?: boolean;
}> = ({ tenantInfo, messageId, from, to, url, recipientDidUrl, packedMessage, show }) => {
  const classes = useStyles();
  const { slug } = tenantInfo;

  // Send Message
  const { val, poster } = useFetcher<string>();
  const sendDIDCommMessage = (body: ISendDIDCommMessageArgs) =>
    poster(`/api/tenants/sendDIDCommMessage?slug=${slug}`, body);

  return (
    <>
      <CardContent className={classes.mail}>
        <Formik
          initialValues={{}}
          onSubmit={async (_, { setSubmitting }) => {
            setSubmitting(true);
            await sendDIDCommMessage({ messageId, packedMessage, recipientDidUrl });
            setSubmitting(false);
          }}>
          {({ isSubmitting, submitForm }) => (
            <Form>
              <SendFab
                tooltip="Send Message"
                loading={isSubmitting}
                submitForm={submitForm}
                icon="mail"
                disabled={isSubmitting || !packedMessage || !!val?.data}
                success={!!val?.data}
                error={!!val?.error}
              />
            </Form>
          )}
        </Formik>
      </CardContent>
      <CardContent>
        <MessageHeader from={from} to={to} url={url} />
      </CardContent>
      <Result isTenantExist={!!tenantInfo} result={val} />
      {val?.data && (
        <CardContent>
          <Typography variant="caption">Transport-id: {val.data}</Typography>
        </CardContent>
      )}
      {show && val?.data && (
        <RawContent content={{ transportId: val.data }} title="Raw Sent-Message" />
      )}
    </>
  );
};
export default SendDIDCommMessage;

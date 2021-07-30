import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExtensionIcon from '@material-ui/icons/Extension';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import type {
  VerifiableCredential,
  ISendDIDCommMessageArgs,
  IPackDIDCommMessageArgs,
  IDIDCommMessage,
  IPackedDIDCommMessage,
} from '@verify/server';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Credential from 'components/Credential';
import Error from 'components/Error';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageHeader from 'components/MessageHeader';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SendFab from 'components/SendFab';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { getTenantDid, useFetcher, useNextAuthUser, useReSWR, useTenant } from 'utils';
import { v4 as uuidv4 } from 'uuid';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const pattern = "d.M.yyyy HH:mm:ss 'GMT' XXX (z)";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    mail: { margin: theme.spacing(1, 5, 0) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '50ch',
      },
    },
  })
);

const CredentialsDetailsPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // DidComm V2 messageId
  const [messageId, setMessageId] = useState<string>('');

  // see example https://github.com/veramolabs/agent-explorer/blob/main/src/components/standard/CreateRequest.tsx
  const getPackDIDCommMessageArgs: (vc: VerifiableCredential) => IPackDIDCommMessageArgs = (vc) => {
    setMessageId(uuidv4());
    const message: IDIDCommMessage = {
      type: 'application/didcomm-encrypted+json',
      from: vc.issuer.id,
      to: vc.credentialSubject.id as string,
      id: messageId,
      body: vc,
    };
    return { message, packing: 'authcrypt' };
  };

  // Query Credential
  const id = router.query.id as string; // hash
  const url = slug ? `/api/credentials/${id}?slug=${slug}&id=${id}` : null;
  const { data: vc, isLoading, isError, error } = useReSWR<VerifiableCredential>(url, !!slug);
  const claims = vc?.credentialSubject && omit(vc?.credentialSubject, 'id');

  // Pack Message
  const { val: packedMessage, poster: pack } = useFetcher<IPackedDIDCommMessage>();
  const packDIDCommMessage = (body: IPackDIDCommMessageArgs) =>
    pack(`/api/tenants/packDIDCommMessage?slug=${slug}`, body);
  // DEBUG INFO
  // pack will return
  // '{"protected":"eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwic2tpZCI6ImRpZDp3ZWI6aXNzdWVyLmV4YW1wbGUuY29tI2NjODBkY2QwMWI5YWU2YWU3MWIwNWEyZGY0MzYwMWMzNTA4ODVkY2QwYjk5ZmZiNmM1YTg1ODY4ZjA4N2E1MmIiLCJlbmMiOiJYQzIwUCJ9","iv":"ynLu_fvvtO5E6NARXhQVU6QbpwPwB3Yk","ciphertext":"kg0347geKXcwh5yQlVqUl929qQGNLqYNBd1frYeP2sVK37RyoOCY-O6VnXHVUVMZnpE8KlbGgm4lFJb0QUcRsw30NFz0oubeP1NLBTqhX4aqVVtihx3lHxVXErqn3HQdvHbOPAccYqX_5NIT12TFGpcqjJP3M9r6FaM5zPGteVAk05IXYA7MizCRIlRzR5zPT5xd9DZaHDzZumI4gKHgCZxOeaY_WBzpo2FZIUqD4TBdiNrtn8y7YvO3fPBIzgR-7wtQqXBQvTJbL6lCxGO4W5QIJFuE0b8L9q3EI55KBb66MkTvXT8atDrJbiTv680QcTRXn1w7GFTX0laIdMnIDv1W85mzrmtAFn7kYuZdac6wbyJPR7s8yD4BHB9wPu0bHdrtXe9q9D7l4yqn-coP9rEklaVmp_Rp9sSaZ863uXwm9STVCb5H6wN_zc0IOzsBpwQUm8RKC4KFDRi0aOh84yZ3XE6ZD7eIoB0aARe8qGeRzkLQ5BmYiWfJ1QRJSzRBoXIUpxUhX_e8wlJ3CHJnKruk3yNsY8UtaToZNOjr0bs2XrrkSmKf9GQUfycNCEzeyWWO4eDQkgJ4Bhe7KhhiCCmU-3a2CX93orLVFTPXNA8YV_s9EUPq1FRiq-SnEac2HROXcN4ifeAc6Bba3k47-NOpu_qQBqMDrLt_tvzWM_L-98tgS9MN17oOL3aGAxZ08Ca4rXOpx7MAEmEKCOJda8uRbqTDoHxAHiWweD7KNaCwgV5Atv4eXDZFjO0Y0a6cJFIufsM6X-gKbiue9Faxua7yoJ6utcoSWrBnIiXA","tag":"ZjQCYwOVWyTR1eQPdnJ2Ig","recipients":[{"encrypted_key":"xwGSyDJKWfPytCnAustgK9lf4d_M933cN1VFz5x7MpA","header":{"alg":"ECDH-1PU+XC20PKW","iv":"LeR6SLF7iehZZlpKWrmq5kxNzL-sG3Dl","tag":"OuUAvtdrfoxEJIY9QOapvw","epk":{"kty":"OKP","crv":"X25519","x":"3jyJci44SKvE5fMha64Ho11XE7va2Uby3ISqf6LC1yg"},"kid":"did:web:issuer.example.com:users:banana#6e2a516ba75ba9283fc0ec6be21d8b15a8f6646063babe2bde3162b5f395d5e7"}}]}';
  //
  // or after JSON.parse
  // const output = {
  //   ciphertext:
  //     'kg0347geKXcwh5yQlVqUl929qQGNLqYNBd1frYeP2sVK37RyoOCY-O6VnXHVUVMZnpE8KlbGgm4lFJb0QUcRsw30NFz0oubeP1NLBTqhX4aqVVtihx3lHxVXErqn3HQdvHbOPAccYqX_5NIT12TFGpcqjJP3M9r6FaM5zPGteVAk05IXYA7MizCRIlRzR5zPT5xd9DZaHDzZumI4gKHgCZxOeaY_WBzpo2FZIUqD4TBdiNrtn8y7YvO3fPBIzgR-7wtQqXBQvTJbL6lCxGO4W5QIJFuE0b8L9q3EI55KBb66MkTvXT8atDrJbiTv680QcTRXn1w7GFTX0laIdMnIDv1W85mzrmtAFn7kYuZdac6wbyJPR7s8yD4BHB9wPu0bHdrtXe9q9D7l4yqn-coP9rEklaVmp_Rp9sSaZ863uXwm9STVCb5H6wN_zc0IOzsBpwQUm8RKC4KFDRi0aOh84yZ3XE6ZD7eIoB0aARe8qGeRzkLQ5BmYiWfJ1QRJSzRBoXIUpxUhX_e8wlJ3CHJnKruk3yNsY8UtaToZNOjr0bs2XrrkSmKf9GQUfycNCEzeyWWO4eDQkgJ4Bhe7KhhiCCmU-3a2CX93orLVFTPXNA8YV_s9EUPq1FRiq-SnEac2HROXcN4ifeAc6Bba3k47-NOpu_qQBqMDrLt_tvzWM_L-98tgS9MN17oOL3aGAxZ08Ca4rXOpx7MAEmEKCOJda8uRbqTDoHxAHiWweD7KNaCwgV5Atv4eXDZFjO0Y0a6cJFIufsM6X-gKbiue9Faxua7yoJ6utcoSWrBnIiXA',
  //   iv: 'ynLu_fvvtO5E6NARXhQVU6QbpwPwB3Yk',
  //   protected:
  //     'eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwic2tpZCI6ImRpZDp3ZWI6aXNzdWVyLmV4YW1wbGUuY29tI2NjODBkY2QwMWI5YWU2YWU3MWIwNWEyZGY0MzYwMWMzNTA4ODVkY2QwYjk5ZmZiNmM1YTg1ODY4ZjA4N2E1MmIiLCJlbmMiOiJYQzIwUCJ9',
  //   recipients: [
  //     {
  //       encrypted_key: 'xwGSyDJKWfPytCnAustgK9lf4d_M933cN1VFz5x7MpA',
  //       header: {
  //         alg: 'ECDH-1PU+XC20PKW',
  //         epk: { crv: 'X25519', kty: 'OKP', x: '3jyJci44SKvE5fMha64Ho11XE7va2Uby3ISqf6LC1yg' },
  //         iv: 'LeR6SLF7iehZZlpKWrmq5kxNzL-sG3Dl',
  //         kid: 'did:web:issuer.example.com:users:banana#6e2a516ba75ba9283fc0ec6be21d8b15a8f6646063babe2bde3162b5f395d5e7',
  //         tag: 'OuUAvtdrfoxEJIY9QOapvw',
  //       },
  //     },
  //   ],
  //   tag: 'ZjQCYwOVWyTR1eQPdnJ2Ig',
  // };

  // Send Message
  const { val: sendMessageResult, poster } = useFetcher<string>();
  const sendDIDCommMessage = (body: ISendDIDCommMessageArgs) =>
    poster(`/api/tenants/sendDIDCommMessage?slug=${slug}`, body);

  // check if you are recipient, or originating issuer
  // Only if the originating issuer (not recipient) can pack and send it
  const isRecipient: () => boolean | undefined = () => {
    // active tenant's Web DID
    const tenantDid = slug && getTenantDid(slug, domain as string);
    const subject = vc?.credentialSubject?.id;
    return subject && tenantDid ? subject.startsWith(tenantDid) : undefined;
  };

  // form state - helpDialog
  const [openHelp, setHelpOpen] = React.useState(false);
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <Layout title="Credential" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="Credential"
        subtitle="Send verifiable credential"
        parentText="Credentials"
        parentUrl={`/dashboard/${tenantInfo?.id}/credentials`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && vc && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={<AvatarMd5 subject={id || 'idle'} image="identicon" />}
              title={JSON.stringify(vc.type, null, 2)}
              subheader={format(new Date(vc.issuanceDate), pattern)}
              action={
                <IconButton onClick={handleHelpOpen}>
                  <HelpOutlineOutlinedIcon />
                </IconButton>
              }
            />
            <HelpDialog
              open={openHelp}
              handleClose={handleHelpClose}
              content={<GlossaryTerms terms={[TERMS.did]} />}
            />
            <CardContent>
              <Card variant="outlined">
                <Credential vc={vc} tenantInfo={tenantInfo} hash={id} />
                {show && vc && <RawContent content={vc} title="Raw Credential Details" />}
              </Card>
            </CardContent>
            {!isRecipient() && (
              <CardContent>
                <Card className={classes.root} variant="outlined">
                  {/* Pack Message */}
                  <Formik
                    initialValues={{}}
                    onSubmit={async (_, { setSubmitting }) => {
                      setSubmitting(true);
                      await packDIDCommMessage(getPackDIDCommMessageArgs(vc));
                      setSubmitting(false);
                    }}>
                    {({ isSubmitting, submitForm }) => (
                      <Form>
                        <CardHeader
                          className={classes.root}
                          title="Step 1: Pack Credential"
                          subheader="Click icon to pack it into DIDComm message"
                        />
                        <CardContent className={classes.mail}>
                          <SendFab
                            loading={isSubmitting}
                            disabled={isSubmitting || !vc || !!packedMessage?.data?.message}
                            submitForm={submitForm}
                            success={!!packedMessage?.data}
                            error={!!packedMessage?.error}
                            icon="pack"
                          />
                        </CardContent>
                        <CardContent>
                          <MessageHeader
                            from={vc?.issuer.id}
                            to={vc?.credentialSubject?.id}
                            createdAt={vc?.issuanceDate}
                          />
                        </CardContent>
                        <CardContent>
                          <Card variant="outlined">
                            <CardHeader subheader="Claims" />
                            <CardContent>
                              {claims &&
                                Object.entries(claims).map(([key, value], index) => (
                                  <MuiTextField
                                    key={index}
                                    disabled={true}
                                    size="small"
                                    label={key}
                                    value={value}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <ExtensionIcon />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                ))}
                            </CardContent>
                          </Card>
                        </CardContent>
                        <Result isTenantExist={!!tenantInfo} result={packedMessage} />
                        {show && packedMessage?.data && (
                          <RawContent content={packedMessage.data} title="Raw Pack-message" />
                        )}
                      </Form>
                    )}
                  </Formik>
                </Card>
                {packedMessage?.data && (
                  <Card className={classes.root} variant="outlined">
                    {/* Send Message */}
                    <Formik
                      initialValues={{}}
                      onSubmit={async (_, { setSubmitting }) => {
                        setSubmitting(true);
                        await sendDIDCommMessage({
                          messageId,
                          packedMessage: packedMessage.data as IPackedDIDCommMessage,
                          recipientDidUrl: vc.credentialSubject.id as string,
                        });
                        setSubmitting(false);
                      }}>
                      {({ isSubmitting, submitForm }) => (
                        <Form>
                          <CardHeader
                            className={classes.root}
                            title="Step 2: Send Credential"
                            subheader="Click icon to send below message"
                          />
                          <CardContent className={classes.mail}>
                            <SendFab
                              loading={isSubmitting}
                              disabled={
                                isSubmitting ||
                                !vc ||
                                !packedMessage?.data?.message ||
                                !!sendMessageResult?.data
                              }
                              submitForm={submitForm}
                              success={!!sendMessageResult?.data}
                              error={!!sendMessageResult?.error}
                            />
                          </CardContent>
                          {packedMessage?.data?.message && (
                            <CardContent>
                              <RawContent
                                title="Message to send"
                                content={JSON.parse(packedMessage.data.message)}
                              />
                            </CardContent>
                          )}
                          <Result isTenantExist={!!tenantInfo} result={sendMessageResult} />
                          {show && sendMessageResult?.data && (
                            <RawContent
                              content={{ transportId: sendMessageResult.data, messageId }}
                              title="Raw Send-message result"
                            />
                          )}
                        </Form>
                      )}
                    </Formik>
                  </Card>
                )}
              </CardContent>
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default CredentialsDetailsPage;

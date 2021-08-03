import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExtensionIcon from '@material-ui/icons/Extension';
import type { VerifiableCredential, IPackedDIDCommMessage } from '@verify/server';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Credential from 'components/Credential';
import Error from 'components/Error';
import { TERMS } from 'components/GlossaryTerms';
import HelpButton from 'components/HelpButton';
import Layout from 'components/Layout';
import Main from 'components/Main';
import PackDIDCommMessage from 'components/PackDIDCommMessage';
import RawContent from 'components/RawContent';
import SendDIDCommMessage from 'components/SendDIDCommMessage';
import { format } from 'date-fns';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { getTenantDid, useNextAuthUser, useReSWR, useTenant } from 'utils';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import CardHeaderAvatar from '../../../../components/CardHeaderAvatar';

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
  const [packedVc, setPackedVc] = useState<IPackedDIDCommMessage>();

  // Query Credential
  const id = router.query.id as string; // hash
  const url = slug ? `/api/credentials/${id}?slug=${slug}&id=${id}` : null;
  const { data: vc, isLoading, isError, error } = useReSWR<VerifiableCredential>(url, !!slug);
  const claims = vc?.credentialSubject && omit(vc?.credentialSubject, 'id');

  // check if you are recipient, or originating issuer
  // Only if the originating issuer (not recipient) can pack and send it
  const isRecipient: () => boolean | undefined = () => {
    // active tenant's Web DID
    const tenantDid = slug && getTenantDid(slug, domain as string);
    const subject = vc?.credentialSubject?.id;
    return subject && tenantDid ? subject.startsWith(tenantDid) : undefined;
  };

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
              avatar={
                <CardHeaderAvatar>
                  <BallotOutlinedIcon />
                </CardHeaderAvatar>
              }
              title={JSON.stringify(vc.type, null, 2)}
              subheader={format(new Date(vc.issuanceDate), pattern)}
              action={<HelpButton terms={[TERMS.did]} />}
            />
            <CardContent>
              <Card variant="outlined">
                <Credential vc={vc} tenantInfo={tenantInfo} hash={id} />
                {show && vc && <RawContent content={vc} title="Raw Credential Details" />}
              </Card>
            </CardContent>
            {!isRecipient() && (
              <CardContent>
                {/* Pack Message */}
                <Card className={classes.root} variant="outlined">
                  <CardHeader
                    className={classes.root}
                    title="Step 1: Pack Credential"
                    subheader="Click icon to pack it into DIDComm message"
                    action={<HelpButton terms={[TERMS.did]} />}
                  />
                  <PackDIDCommMessage
                    tenantInfo={tenantInfo}
                    show={show}
                    from={vc.issuer.id}
                    to={vc.credentialSubject.id as string}
                    body={vc}
                    messageId={messageId}
                    setMessageId={setMessageId}
                    setPackedMessage={setPackedVc}
                  />
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
                </Card>
                {/* Send Message */}
                {packedVc && (
                  <Card className={classes.root} variant="outlined">
                    <CardHeader
                      className={classes.root}
                      title="Step 2: Send Credential"
                      subheader="Click icon to send below message"
                      action={<HelpButton terms={[TERMS.did]} />}
                    />
                    <SendDIDCommMessage
                      tenantInfo={tenantInfo}
                      messageId={messageId}
                      from={vc.issuer.id}
                      to={vc.credentialSubject.id as string}
                      url={''}
                      recipientDidUrl={vc.credentialSubject.id as string}
                      packedMessage={packedVc}
                    />
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

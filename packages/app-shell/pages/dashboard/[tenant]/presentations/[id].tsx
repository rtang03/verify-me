import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { VerifiablePresentation } from '@verify/server';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Presentation from 'components/Presentation';
import RawContent from 'components/RawContent';
import { format } from 'date-fns';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useNextAuthUser, useReSWR, useTenant } from 'utils';

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

  return (
    <Layout title="Presentation" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="Presentation"
        subtitle="Verifiable presentation"
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
              avatar={<AvatarMd5 subject={id || 'idle'} image="identicon" />}
            />
            <CardContent>
              <Presentation vp={vp} />
              {show && <RawContent content={vp} title="Raw Presentation Details" />}
            </CardContent>
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default PresentationDetailsPage;

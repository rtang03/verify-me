import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ScreenShareOutlinedIcon from '@material-ui/icons/ScreenShareOutlined';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Error from 'components/Error';
import { TERMS } from 'components/GlossaryTerms';
import HelpButton from 'components/HelpButton';
import Layout from 'components/Layout';
import Main from 'components/Main';
import NoRecord from 'components/NoRecord';
import PresentationCard from 'components/PresentationCard';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import type { PaginatedVerifiablePresentation } from 'types';
import { useNextAuthUser, usePagination, useReSWR, useTenant } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const PresentationIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Pagination
  const { cursor, pageChange } = usePagination(PAGESIZE);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Presentation
  // const args = JSON.stringify({ where: [{ column: 'subject', op: 'IsNull', not: true }] });
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug ? `/api/presentations?slug=${slug}&cursor=${cursor}&pagesize=${PAGESIZE}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedVerifiablePresentation>(
    url,
    shouldFetch
  );
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Presentation" shouldShow={[show, setShow]} user={activeUser} sideBarIndex={3}>
      <Main
        session={session}
        title="Presentation"
        subtitle="Create and validate presentation"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && (
          <QuickAction
            tooltip="Create and send"
            icon="send"
            link={`/dashboard/${tenantInfo?.id}/presentations/create`}
            label="1"
            disabled={!tenantInfo?.id}
          />
        )}
        {tenantInfo?.activated && !!data?.items?.length && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={
                <CardHeaderAvatar>
                  <ScreenShareOutlinedIcon />
                </CardHeaderAvatar>
              }
              title="Presentations"
              subheader={<>Total: {data?.total || 0}</>}
              action={<HelpButton terms={[TERMS.did]} />}
            />
            <Pagination
              variant="outlined"
              shape="rounded"
              count={count}
              showFirstButton
              showLastButton
              onChange={pageChange}
            />
            <CardContent>
              {data.items.map(({ verifiablePresentation, hash }) => (
                <Card className={classes.root} variant="outlined" key={hash}>
                  <PresentationCard
                    tenantInfo={tenantInfo}
                    vp={verifiablePresentation}
                    hash={hash}
                  />
                  {show && (
                    <RawContent
                      title="Raw Presentation"
                      content={omit(verifiablePresentation, '@context')}
                    />
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
        {tenantInfo && !data?.items?.length && !isLoading && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default PresentationIndexPage;

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { green, grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import PeopleAltOutlinedIcon from '@material-ui/icons/PeopleAltOutlined';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Error from 'components/Error';
import IdentifierCard from 'components/IdentifierCard';
import Layout from 'components/Layout';
import Main from 'components/Main';
import NoRecord from 'components/NoRecord';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { useNextAuthUser, usePagination, useQueryIdentifier, useTenant } from 'utils';

const PAGESIZE = 4;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    green: {
      color: '#fff',
      backgroundColor: green[500],
    },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const UsersIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { cursor, pageChange } = usePagination(PAGESIZE);

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query IIdentifiers
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const {
    count,
    isQueryIdentifierError,
    isQueryIdentifierLoading,
    queryIdentifierError,
    paginatedIdentifier,
  } = useQueryIdentifier({
    slug,
    pageSize: PAGESIZE,
    shouldFetch,
  });

  return (
    <Layout title="Users" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="User Identifers"
        subtitle="Setup decentralized identity for users. Learn more"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || (isQueryIdentifierLoading && shouldFetch)}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isQueryIdentifierError && !isQueryIdentifierLoading && (
          <Error error={queryIdentifierError} />
        )}
        {tenantInfo?.activated && (
          <QuickAction
            tooltip="Create user identifier"
            link={`/dashboard/${tenantInfo?.id}/users/create`}
            label="1"
            disabled={!tenantInfo?.id}
          />
        )}
        {tenantInfo?.activated && !!paginatedIdentifier?.items?.length && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={
                <CardHeaderAvatar>
                  <PeopleAltOutlinedIcon />
                </CardHeaderAvatar>
              }
              title="Active identifiers"
              subheader={<>Total: {paginatedIdentifier?.total || 0}</>}
            />
            <Pagination
              variant="outlined"
              shape="rounded"
              count={count}
              showFirstButton
              showLastButton
              onChange={pageChange}
            />
            <CardContent className={classes.root}>
              {paginatedIdentifier.items.map((item, index) => (
                <IdentifierCard key={index} identifier={item} tenantInfo={tenantInfo} />
              ))}
            </CardContent>
            {show && paginatedIdentifier && (
              <RawContent title="Raw Ids" content={paginatedIdentifier} />
            )}
          </Card>
        )}
        {tenantInfo && !paginatedIdentifier?.items?.length && !isQueryIdentifierLoading && (
          <NoRecord />
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default UsersIndexPage;

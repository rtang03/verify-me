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
import type { PaginatedIIdentifier } from 'types';
import { usePagination, useReSWR, useTenant } from 'utils';

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

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query IIdentifiers
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug ? `/api/users?slug=${slug}&cursor=${cursor}&pagesize=${PAGESIZE}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedIIdentifier>(url, shouldFetch);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Users" shouldShow={[show, setShow]}>
      <Main
        session={session}
        title="User Identifers"
        subtitle="Setup decentralized identity for users. Learn more"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || (isLoading && shouldFetch)}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && (
          <QuickAction
            link={`/dashboard/${tenantInfo?.id}/users/create`}
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
                  <PeopleAltOutlinedIcon />
                </CardHeaderAvatar>
              }
              title="Active identifiers"
              subheader={<>Total: {data?.total || 0}</>}
            />
            <Pagination count={count} showFirstButton showLastButton onChange={pageChange} />
            <CardContent className={classes.root}>
              {data.items.map((item, index) => (
                <IdentifierCard key={index} identifier={item} tenantInfo={tenantInfo} />
              ))}
            </CardContent>
            {show && data && <RawContent title="Raw Ids" content={data} />}
          </Card>
        )}
        {tenantInfo && !data?.items?.length && !isLoading && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default UsersIndexPage;

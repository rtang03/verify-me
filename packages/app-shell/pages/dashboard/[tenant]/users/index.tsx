import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import NoRecord from 'components/NoRecord';
import QuickAction from 'components/QuickAction';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Fragment, useState } from 'react';
import type { PaginatedIIdentifier, PaginatedTenant } from 'types';
import { getTenantInfo, useReSWR } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: '60ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: { display: 'inline' },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const tenantId = router.query.tenant as string;

  // handle PageChange upon pagination
  const [pageIndex, setPageIndex] = useState(0);
  const handlePageChange = (event: React.ChangeEvent<unknown>, pagenumber: number) =>
    setPageIndex((pagenumber - 1) * PAGESIZE);

  // Query TenantInfo
  const {
    data: tenant,
    isError: tenantError,
    isLoading: tenantLoading,
  } = useReSWR<PaginatedTenant>(`/api/tenants?id=${tenantId}`, tenantId !== '0');
  const tenantInfo = getTenantInfo(tenant);
  const slug = tenantInfo?.slug;

  // Query IIdentifiers
  const url = slug
    ? `/api/users?slug=${slug}&cursor=${pageIndex * PAGESIZE}&pagesize=${PAGESIZE}`
    : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedIIdentifier>(url, !!slug);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Users">
      <Main
        session={session}
        title="User Identifers"
        subtitle="Setup decentralized identity for users. Learn more"
        parentText={`Dashboard/${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || isLoading}>
        <QuickAction
          link={`/dashboard/${tenantInfo?.id}/users/create`}
          label="+ CREATE IDENTIFIER"
          disabled={!tenantInfo?.id}
        />
        {tenantError && !tenantLoading && <Error />}
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
        {tenantInfo?.activated && data?.items?.length && (
          <Card className={classes.root}>
            <CardHeader title="Active identifiers" subheader={<>Total: {data?.total || 0}</>} />
            <Pagination count={count} showFirstButton showLastButton onChange={handlePageChange} />
            <br />
            <CardContent>
              <List className={classes.root}>
                {data.items.map((item, index) => (
                  <Fragment key={index}>
                    <ListItem>
                      {item.did.includes('users:') ? (
                        <>
                          <ListItemAvatar>
                            <AvatarMd5 subject={item.did || 'idle'} />
                          </ListItemAvatar>
                          <Link href={`/dashboard/${tenantInfo.id}/users/${item.alias}`}>
                            <a>
                              <ListItemText primary={item.alias} secondary={item.did} />
                            </a>
                          </Link>
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="settings">
                              <SettingsIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </>
                      ) : (
                        <>
                          <ListItemAvatar>
                            <AvatarMd5 subject={item.did || 'idle'} />
                          </ListItemAvatar>
                          <ListItemText primary={item.alias} secondary={item.did} />
                        </>
                      )}
                    </ListItem>
                    <Divider variant="inset" />
                  </Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        {tenantInfo && !data?.items?.length && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

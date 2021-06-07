import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { Fragment } from 'react';
import type { PaginatedTenant } from 'types';
import { usePagination, useReSWR } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: '80ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: { display: 'inline' },
  })
);

const DashboardIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { pageIndex, pageChange } = usePagination(PAGESIZE);
  const { data, isError, isLoading } = useReSWR<PaginatedTenant>(
    `/api/tenants?cursor=${pageIndex * PAGESIZE}&pagesize=${PAGESIZE}`
  );

  let count;
  if (data && !isLoading) count = Math.ceil(data.total / PAGESIZE);

  return (
    <Layout title="Tenant">
      <Main
        session={session}
        title="Tenants"
        subtitle="List of tenants. Learn more"
        isLoading={isLoading}>
        <br />
        {!!data?.items?.length && !isLoading && (
          <Card className={classes.root}>
            <CardHeader subheader={<>Total: {data?.total || 0}</>} />
            <CardContent>
              <Pagination
                count={count}
                showFirstButton
                showLastButton
                onChange={pageChange}
              />
              <br />
              <List className={classes.root}>
                {data.items.map((item, index) => (
                  <Fragment key={index}>
                    <Link href={`/dashboard/${item.id}`}>
                      <a>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <AvatarMd5 subject={item.id || 'idle'} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.slug}
                            secondary={
                              <Fragment>
                                <Typography
                                  component="span"
                                  variant="caption"
                                  className={classes.inline}
                                  color="textPrimary">
                                  {item.name || 'No content'}
                                </Typography>
                              </Fragment>
                            }
                          />
                        </ListItem>
                      </a>
                    </Link>
                    <Divider variant="inset" component="li" />
                  </Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        {isError && !isLoading && <Error />}
        {/* WHEN NO TENTANT */}
        {data?.items?.length === 0 && !isLoading && (
          <>
            <Typography variant="caption" color="secondary">
              ‼️ No tenant found. You must create first tenant to proceed.
            </Typography>
            <br />
            <br />
            <Link href="/dashboard/create">
              <Button size="small" variant="contained">
                + CREATE TENANT
              </Button>
            </Link>
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default DashboardIndexPage;

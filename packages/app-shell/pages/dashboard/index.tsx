import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import FlashAutoOutlinedIcon from '@material-ui/icons/FlashAutoOutlined';
import FlashOffOutlinedIcon from '@material-ui/icons/FlashOffOutlined';
import FlashOnOutlined from '@material-ui/icons/FlashOnOutlined';
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import ProTip from 'components/ProTip';
import QuickAction from 'components/QuickAction';
import md5 from 'md5';
import type { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';
import type { PaginatedTenant, Session } from 'types';
import { useActiveTenant, useNextAuthUser, usePagination, useReSWR } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    card: { display: 'flex', margin: theme.spacing(3, 1, 2) },
    details: {
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(0.5),
    },
    media: {
      height: 150,
      width: 150,
    },
    button: {
      '&:hover': {
        'font-weight': 'bold',
      },
    },
  });
});
const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';
const uri = (subject: string, size: number) => `${GRAVATAR_URI}${md5(subject)}?s=${size}&d=wavatar`;

const DashboardIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Pagination
  const { cursor, pageChange } = usePagination(PAGESIZE);
  const { data, isError, isLoading } = useReSWR<PaginatedTenant>(
    `/api/tenants?cursor=${cursor}&pagesize=${PAGESIZE}`
  );

  let count;
  if (data && !isLoading) count = Math.ceil(data.total / PAGESIZE);

  // GET ACTIVE TENANT
  const { activeTenant, updateActiveTenant } = useActiveTenant({
    activeTenantId: activeUser?.active_tenant,
  });

  return (
    <Layout title="Tenant" user={activeUser}>
      <Main
        session={session}
        title="Tenants"
        subtitle="List of tenants. Learn more"
        isLoading={isLoading}>
        {!!data?.items?.length && !isLoading && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={
                <CardHeaderAvatar>
                  <StorefrontOutlinedIcon />
                </CardHeaderAvatar>
              }
              title="All tenants"
              subheader={<>Total: {data?.total || 0}</>}
            />
            <CardContent>
              <Pagination count={count} showFirstButton showLastButton onChange={pageChange} />
              <br />
              {data.items.map((item, index) => (
                <Card key={index} variant="outlined" className={classes.card}>
                  <Link href={`/dashboard/${item.id}`}>
                    <a>
                      <CardMedia className={classes.media} image={uri(item.id || 'idle', 200)} />
                    </a>
                  </Link>
                  <div className={classes.details}>
                    <CardHeader
                      avatar={
                        item.activated ? (
                          <CardHeaderAvatar>
                            {activeTenant?.id === item.id ? (
                              <Tooltip title="Activated / Default">
                                <FlashAutoOutlinedIcon />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Activated">
                                <FlashOnOutlined />
                              </Tooltip>
                            )}
                          </CardHeaderAvatar>
                        ) : (
                          <CardHeaderAvatar>
                            <Tooltip title="Not activated">
                              <FlashOffOutlinedIcon />
                            </Tooltip>
                          </CardHeaderAvatar>
                        )
                      }
                      title={item.slug?.toUpperCase()}
                      subheader={item.name || 'No content'}
                    />
                    {item?.id && item?.slug && activeTenant?.id !== item.id && (
                      <CardActions>
                        <Button
                          variant="outlined"
                          className={classes.button}
                          size="small"
                          color="inherit"
                          onClick={async () =>
                            updateActiveTenant(session.user.id as string, item.id as string)
                          }>
                          Make Default
                        </Button>
                      </CardActions>
                    )}
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
        {isError && !isLoading && <Error />}
        {/* WHEN NO TENTANT */}
        {data?.items?.length === 0 && !isLoading && (
          <>
            <QuickAction link="/dashboard/create" label="TENANT" disabled={false} />
            <br />
            <ProTip text="No tenant found. You must create first tenant to proceed." />
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default DashboardIndexPage;

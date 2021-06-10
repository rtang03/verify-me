import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import NoRecord from 'components/NoRecord';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React from 'react';
import JSONTree from 'react-json-tree';
import type { PaginatedMessage } from 'types';
import { usePagination, useReSWR, useTenant } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: '100ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: { display: 'inline' },
  })
);

const MessagesIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { pageIndex, pageChange } = usePagination(PAGESIZE);

  // Query Messages
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug
    ? `/api/messages?slug=${slug}&cursor=${pageIndex * PAGESIZE}&pagesize=${PAGESIZE}`
    : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedMessage>(url, shouldFetch);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Messages">
      <Main
        session={session}
        title="Inbox"
        subtitle="Incoming messages. Learn more"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || (isLoading && shouldFetch)}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && !!data?.items?.length && (
          <Card className={classes.root}>
            <CardHeader title="Messages" subheader={<>Total: {data?.total || 0}</>} />
            <Pagination count={count} showFirstButton showLastButton onChange={pageChange} />
            <CardContent>
              <List dense className={classes.root}>
                {data &&
                  data.items.map((item, index) => (
                    <ListItem key={index}>
                      <Card className={classes.root} variant="outlined">
                        <Link href={`/dashboard/${tenantInfo.id}/messages/${item.id}`}>
                          <a>
                            <CardHeader
                              avatar={<AvatarMd5 subject={item.id} />}
                              title={`subject: ${item.to}`}
                              subheader={`Type: "${item.type}" at ${item.createdAt} `}
                            />
                          </a>
                        </Link>
                        {item.type === 'w3c.vc' && (
                          <CardContent>
                            <JSONTree
                              hideRoot={true}
                              data={item?.credentials?.map((cred) =>
                                omit(cred, '@context', 'proof', 'type')
                              )}
                            />
                          </CardContent>
                        )}
                        {item.type === 'sdr' && (
                          <CardContent>
                            <JSONTree
                              hideRoot={true}
                              data={omit(item, 'type', 'raw', 'id', 'metaData', 'createdAt')}
                            />
                          </CardContent>
                        )}
                      </Card>
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        )}
        {tenantInfo && !data?.items?.length && !isLoading && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default MessagesIndexPage;

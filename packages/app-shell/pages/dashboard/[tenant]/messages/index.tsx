import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import type { IMessage, Paginated } from '@verify/server';
import { requireAuth } from 'components';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import md5 from 'md5';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { Fragment, useEffect } from 'react';
import JSONTree from 'react-json-tree';
import { useFetcher } from 'utils';

const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';
const uri = (did: string) => GRAVATAR_URI + md5(did) + '?s=200&d=retro';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<Paginated<IMessage>>();

  useEffect(() => {
    fetcher(`/api/messages`).finally(() => true);
  }, [session]);

  return (
    <Layout title="Messages">
      {session && (
        <>
          <Typography variant="h4">Inbox</Typography>
          <Typography variant="caption">Incoming messages. Learn more</Typography>
          <br />
          <br />
          {val.loading ? <LinearProgress /> : <Divider />}
          {val?.data?.items?.length ? (
            <>
              <br />
              <Typography variant="h5">Messages</Typography>
              <Typography variant="caption">total: {val.data.total}</Typography>
              <List dense>
                {val.data.items.map((item: any, index) => (
                  <ListItem key={index}>
                    <Avatar src={uri(item?.data?.iss || '')} />
                    <Link href={`/dashboard/1/messages/${item.id}`}>
                      <a>
                        <ListItemText primary={`From: ${item.from}`} secondary={`To: ${item.to}`} />
                        <Typography variant="caption">Type: {item.type} - created at {item.createdAt}</Typography>
                      </a>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="h6">No record</Typography>
          )}
        </>
      )}
      {!session && <AccessDenied />}
    </Layout>
  );
};

export const getServerSideProps = requireAuth;

export default Page;

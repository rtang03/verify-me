import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import type { IIdentifier } from '@veramo/core';
import type { Paginated } from '@verify/server';
import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useFetcher } from 'utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const { val, fetcher } = useFetcher<Paginated<IIdentifier>>();

  useEffect(() => {
    fetcher(`/api/users`).finally(() => true);
  }, [session]);

  return (
    <Layout title="Users">
      <Main
        session={session}
        title="Users Identitifers"
        subtitle="Setup decentralized identity for users. Learn more">
        <Link href="/dashboard/1/users/create">
          <Button size="small" variant="contained">
            + CREATE IDENTIFIER
          </Button>
        </Link>
        {val.loading ? <LinearProgress /> : <Divider />}
        {val.data?.items?.length ? (
          <>
            <Typography variant="h5">Did-Documents</Typography>
            <Typography variant="caption">total: {val.data.total}</Typography>
            <List dense>
              {val.data.items.map((item, index) => (
                <ListItem key={index}>
                  {item.did.includes('users:') ? (
                    <>
                      <Link href={`/dashboard/1/users/${item.alias}`}>
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
                      <ListItemText primary={item.alias} secondary={item.did} />
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <p>No record</p>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

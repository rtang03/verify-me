import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import type { PaginatedDIDDocument } from '@verify/server';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import type { NextPage, NextPageContext } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import Link from 'next/link';
import React, { Fragment, useState, useEffect } from 'react';
import { useStyles } from '../../../../utils';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const [paginated, setPaginated] = useState<PaginatedDIDDocument>();
  const classes = useStyles();

  useEffect(() => {
    fetch('/api/dids')
      .then((r) => r.json())
      .then((json) => json?.data?.data && setPaginated(json.data.data));
  }, [session]);

  return (
    <Layout title="Identity">
      {session ? (
        <>
          <Typography variant="h5">Identities</Typography>
          <Typography variant="caption">Setup decentralized identity. Learn more </Typography>
          <br />
          <br />
          <Link href="/dashboard/1/identities/id">
            <Button size="small" variant="contained">
              + CREATE IDENTITY
            </Button>
          </Link>
          <Divider />
          <List dense>
            {paginated ? (
              paginated.items.map((did) => (
                <>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonOutlineIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <Link href={'/dashboard/1/identities/' + did.id}>
                      <a>
                        <ListItemText
                          primary={did.description || 'No description'}
                          secondary={did.id}
                        />
                      </a>
                    </Link>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="settings">
                        <SettingsIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </>
              ))
            ) : (
              <Fragment />
            )}
            <Divider variant="inset" />
          </List>
        </>
      ) : (
        <AccessDenied />
      )}
    </Layout>
  );
};

export const getServerSideProps = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

export default Page;

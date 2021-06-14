import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Footer from 'components/Footer';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/client';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';

  return createStyles({
    root: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      margin: theme.spacing(3, -3, 0),
      padding: theme.spacing(0),
      display: 'flex',
      color: dark ? grey[300] : grey[700],
      backgroundColor: dark ? grey[700] : grey[200],
    },
    firstColumn: {
      width: 250,
      margin: theme.spacing(3, 0, 3, 10),
    },
    column: {
      flexDirection: 'column',
      width: 250,
      margin: theme.spacing(3, 0, 3),
    },
  });
});
const Index: NextPage<null> = () => {
  const [session] = useSession();

  return (
    <Layout title="Home">
      {/*** Before Login ***/}
      {!session?.user && (
        <Grid container direction="row" justify="flex-start" alignItems="flex-start">
          <div>
            <Card>
              <CardHeader title="Decentralized Identity PoC" />
            </Card>
          </div>
        </Grid>
      )}
      {/*** After Login ***/}
      {session?.user && `Hello ${session.user.name}, Welcome!!`}
      {!session?.user && <Footer />}
    </Layout>
  );
};

export default Index;

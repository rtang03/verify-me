import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
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
      margin: theme.spacing(3, 1, 0),
    },
  });
});
const Index: NextPage<null> = () => {
  const [session] = useSession();

  return (
    <Layout title="About">
      About
      {/*** If not Login ***/}
      {!session?.user && <Footer />}
    </Layout>
  );
};

export default Index;

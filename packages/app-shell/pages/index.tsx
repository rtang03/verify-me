import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import SvgIcon from '@material-ui/core/SvgIcon';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/client';
import React from 'react';
import ThreePersonsPic from '../public/undraw_Credit_card_payment_re_o911.svg';
import { LANDING_PAGE } from '../utils';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';

  return createStyles({
    root: {
      display: 'flex',
      width: '100ch',
      padding: theme.spacing(2, 3),
      margin: theme.spacing(3, 1, 2),
      'border-color': dark ? grey[700] : grey[400],
      'border-left': `8px solid ${theme.palette.divider}`,
      'border-radius': '15px 15px'
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    image: {
      fontSize: 300,
    },
  });
});
const Index: NextPage<null> = () => {
  const [session] = useSession();
  const classes = useStyles();

  // if session, did web ready?
  // if session, service end point?
  // default user

  return (
    <Layout title="Home">
      {/*** Before Login ***/}
      {!session?.user && (
        <Grid container>
          <Grid container direction="row" justify="flex-start">
            <div className={classes.root}>
              <div className={classes.details}>
                <CardHeader subheader="Web of Trust" />
                <CardContent>{LANDING_PAGE.main1}</CardContent>
              </div>
              <SvgIcon
                className={classes.image}
                component={ThreePersonsPic}
                viewBox="0 0 816 548.78654"
              />
            </div>
          </Grid>
          <Grid container direction="row" justify="flex-end">
            <div className={classes.root}>
              <div className={classes.details}>
                <CardHeader subheader="Getting Started" />
                <CardContent>{LANDING_PAGE.main1}</CardContent>
              </div>
              <SvgIcon
                className={classes.image}
                component={ThreePersonsPic}
                viewBox="0 0 816 548.78654"
              />
            </div>
          </Grid>
          <Grid container direction="row" justify="flex-start" >
            <div className={classes.root}>
              <div className={classes.details}>
                <CardHeader subheader="Features" />
                <CardContent>{LANDING_PAGE.main1}</CardContent>
              </div>
              <SvgIcon
                className={classes.image}
                component={ThreePersonsPic}
                viewBox="0 0 816 548.78654"
              />
            </div>
          </Grid>
        </Grid>
      )}
      {session?.user && `Hello ${session.user.name}, Welcome!!`}
    </Layout>
  );
};

export default Index;

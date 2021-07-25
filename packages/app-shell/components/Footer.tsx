import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';
import packageJson from '../../../package.json';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return createStyles({
    root: {
      border: `1px solid ${dark ? grey[700] : grey[200]}`,
      width: '100%',
      margin: theme.spacing(0, 0, 0, 0),
      padding: theme.spacing(0),
      color: dark ? grey[300] : grey[600],
      backgroundColor: dark ? grey[700] : grey[200],
    },
    grid: {
      margin: theme.spacing(5, 0, 5, 0),
      padding: theme.spacing(0, 0, 0, 10),
    },
    link: {
      '&:hover': {
        color: dark ? grey[50] : grey[900],
        'font-weight': 'bold',
      },
    },
    paper: {
      padding: theme.spacing(0),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  });
});

const Footer: React.FC<any> = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        className={classes.grid}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start">
        <Grid item xs={2}>
          <Grid container direction="column">
            <Grid item>
              <div className={classes.paper}>v{packageJson.version}-dev</div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Copyright &copy; 2021 Dashslab</div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Terms of Use</div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column">
            <Grid item>
              <div className={classes.paper}>
                <Link href="/about">
                  <a className={classes.link}>About</a>
                </Link>
              </div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>
                <Link href="/contact">
                  <a className={classes.link}>Contact</a>
                </Link>
              </div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Privacy Policy</div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column">
            <Grid item>
              <div className={classes.paper}>Core Concepts</div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Getting Started</div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Docs</div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Footer;

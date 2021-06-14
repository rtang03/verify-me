import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import packageJson from '../../../package.json';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';

  return createStyles({
    root: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      margin: theme.spacing(3, -3, 0, -3),
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
        justify="flex-start"
        alignItems="flex-start">
        <Grid item xs={2} spacing={1}>
          <Grid container direction="column">
            <Grid item>
              <div className={classes.paper}>v{packageJson.version}-dev</div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Copyright &copy; 2021 Dashslab</div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column">
            <Grid item>
              <div className={classes.paper}>About</div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>
                <a className={classes.link} href={`mailto:${packageJson.email}`}>
                  Contact Us
                </a>
              </div>
            </Grid>
            <Grid item>
              <div className={classes.paper}>Privacy</div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column">
            <Grid item>
              <div className={classes.paper}>Help</div>
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

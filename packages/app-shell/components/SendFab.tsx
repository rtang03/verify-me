import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import { green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryptionOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    buttonDone: {
      color: dark ? grey[100] : grey[900],
    },
    fabProgress: {
      color: green[600],
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1,
    },
    submit: {
      color: dark ? grey[900] : grey[100],
      backgroundColor: dark ? grey[100] : grey[900],
      '&:hover': {
        color: dark ? grey[100] : grey[900],
        backgroundColor: dark ? grey[900] : grey[100],
      },
    },
  });
});

const SendFab: React.FC<{
  tooltip?: string;
  disabled: boolean;
  loading: boolean;
  submitForm: () => Promise<any>;
  success: boolean;
  error?: boolean;
}> = ({ tooltip, disabled, loading, submitForm, success, error }) => {
  const classes = useStyles();

  const buttonClassname = clsx({
    [classes.submit]: !success && !error,
  });

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        {!success && !error && tooltip && (
          <Tooltip title={tooltip}>
            <Fab
              color="inherit"
              className={buttonClassname}
              disabled={disabled}
              onClick={() => !loading && submitForm()}>
              <MailOutlineIcon />
            </Fab>
          </Tooltip>
        )}
        {!success && !error && !tooltip && (
          <Fab
            color="inherit"
            className={buttonClassname}
            disabled={disabled}
            onClick={() => !loading && submitForm()}>
            <MailOutlineIcon />
          </Fab>
        )}
        {!!success && !error && (
          <Fab color="inherit" className={classes.buttonDone} disabled={disabled}>
            <CheckIcon />
          </Fab>
        )}
        {!success && !!error && (
          <Fab color="inherit" className={classes.buttonDone} disabled={disabled}>
            <ErrorOutlineOutlinedIcon />
          </Fab>
        )}
        {loading && <CircularProgress size={68} className={classes.fabProgress} />}
      </div>
    </div>
  );
};

export default SendFab;

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
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
      margin: theme.spacing(3, 3, 3),
      position: 'relative',
    },
    buttonDone: {
      width: '20ch',
      backgroundColor: grey[500],
      margin: theme.spacing(3, 1, 3),
    },
    buttonProgress: {
      color: green[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
    submit: {
      width: '20ch',
      margin: theme.spacing(3, 1, 3),
      transition: 'all 0.7s ease-in-out',
      '&:hover': {
        color: dark ? grey[900] : grey[100],
        backgroundColor: dark ? grey[100] : grey[900],
        boxShadow: 'inset rgba(0, 0, 0, 0.3) 0 0 100px, rgba(0, 0, 0, 0.4) 0 -4px 10px',
        borderColor: dark ? grey[100] : grey[900],
      },
    },
  });
});

const SubmitButton: React.FC<{
  tooltip?: string;
  text: string | React.ReactFragment;
  disabled: boolean;
  loading: boolean;
  submitForm: () => Promise<any>;
  success: boolean;
  error?: boolean;
}> = ({ tooltip, text, disabled, loading, submitForm, success, error }) => {
  const classes = useStyles();

  const buttonClassname = clsx({
    [classes.submit]: !success && !error,
  });

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        {!success && !error && !disabled && !!tooltip && (
          <Tooltip title={tooltip}>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              className={buttonClassname}
              disabled={disabled}
              onClick={() => !loading && submitForm()}>
              {text}
            </Button>
          </Tooltip>
        )}
        {!success && !error && disabled && !!tooltip && (
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            className={buttonClassname}
            disabled={disabled}
            onClick={() => !loading && submitForm()}>
            {text}
          </Button>
        )}
        {!success && !error && !tooltip && (
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            className={buttonClassname}
            disabled={disabled}
            onClick={() => !loading && submitForm()}>
            {text}
          </Button>
        )}
        {!!success && !error && (
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            className={classes.buttonDone}
            disabled={disabled}>
            <CheckIcon />
          </Button>
        )}
        {!success && !!error && (
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            className={classes.buttonDone}
            disabled={disabled}>
            <ErrorOutlineOutlinedIcon />
          </Button>
        )}
        {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
      </div>
    </div>
  );
};

export default SubmitButton;

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { grey, green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      backgroundColor: grey[400],
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
    submit: { width: '20ch', margin: theme.spacing(3, 1, 3) },
  })
);

const SubmitButton: React.FC<{
  text: string;
  disabled: boolean;
  loading: boolean;
  submitForm: () => Promise<any>;
  success: boolean;
  error?: boolean;
}> = ({ text, disabled, loading, submitForm, success, error }) => {
  const classes = useStyles();

  const buttonClassname = clsx({
    [classes.buttonDone]: success && !error,
    [classes.buttonDone]: !success && error,
    [classes.submit]: !success && !error,
  });

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <Button
          variant="outlined"
          color="inherit"
          size="large"
          className={buttonClassname}
          disabled={disabled}
          onClick={() => !loading && submitForm()}>
          {!success && !error && <>{text}</>}
          {success && !error && <CheckIcon />}
          {!success && error && <ErrorOutlineOutlinedIcon />}
        </Button>
        {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
      </div>
    </div>
  );
};

export default SubmitButton;

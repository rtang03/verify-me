import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
    button: {
      margin: theme.spacing(2, 0),
      width: '10ch',
      flexWarp: 'wrap',
      '&:hover': {
        color: dark ? grey[900] : grey[100],
        backgroundColor: dark ? grey[100] : grey[900],
      },
    },
    buttonProgress: {
      color: green[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  });
});

const ConfirmationDialog: React.FC<{
  open: boolean;
  handleClose: () => void;
  title: string | React.ReactFragment;
  content: string | React.ReactFragment;
  submitForm: () => Promise<any>;
  confirmDisabled: boolean;
  loading: boolean;
}> = ({ open, title, content, handleClose, submitForm, confirmDisabled, loading }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.button}
          onClick={handleClose}
          size="small"
          variant="outlined"
          color="inherit">
          Cancel
        </Button>
        <div className={classes.root}>
          <div className={classes.wrapper}>
            <Button
              className={classes.button}
              onClick={submitForm}
              disabled={confirmDisabled}
              size="small"
              variant="outlined"
              color="inherit"
              autoFocus>
              Confirm
            </Button>
            {loading && <CircularProgress size={15} className={classes.buttonProgress} />}
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;

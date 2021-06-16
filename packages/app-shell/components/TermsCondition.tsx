import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
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

const TermsCondition: React.FC<any> = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <div>
      <Button size="small" color="inherit" variant="outlined" onClick={handleClickOpen}>
        <Typography variant="caption">Terms and Conditions</Typography>
      </Button>
      <Dialog open={open} onClose={handleClose} scroll="paper">
        <DialogTitle id="scroll-dialog-title">Terms and Conditions</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}>
            {[...new Array(50)]
              .map(
                () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
              )
              .join('\n')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            className={classes.button}
            onClick={handleClose}
            size="small"
            variant="outlined"
            color="inherit">
            Reject
          </Button>
          {/* Accept is NOT fully implement. See example at ConfirmationDialog.tsx */}
          <div className={classes.root}>
            <div className={classes.wrapper}>
              <Button
                className={classes.button}
                onClick={handleClose}
                size="small"
                variant="outlined"
                color="inherit"
                autoFocus>
                Accept
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TermsCondition;

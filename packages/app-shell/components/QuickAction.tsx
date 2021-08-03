import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddToPhotosOutlinedIcon from '@material-ui/icons/AddToPhotosOutlined';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import SaveAltOutlinedIcon from '@material-ui/icons/SaveAltOutlined';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import Link from 'next/link';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return createStyles({
    button: {
      margin: theme.spacing(2, 1),
      width: '25ch',
      flexWarp: 'wrap',
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

const QuickActionComponent: React.FC<{
  tooltip?: string;
  icon?: any;
  label: string;
  link: string;
  disabled: boolean;
}> = ({ tooltip, icon, label, link, disabled }) => {
  const classes = useStyles();
  const ICON = {
    ['edit' as string]: <EditOutlinedIcon />,
    send: <SendOutlinedIcon />,
    credential: <BallotOutlinedIcon />,
    request: <SendOutlinedIcon />,
    save: <SaveAltOutlinedIcon />,
  }[icon] || <AddToPhotosOutlinedIcon />;

  return (
    <>
      {tooltip ? (
        <>
          <Link href={link}>
            <Tooltip title={tooltip}>
              <Button
                className={classes.button}
                startIcon={ICON}
                color="inherit"
                size="large"
                variant="outlined"
                disabled={disabled}>
                {label}
              </Button>
            </Tooltip>
          </Link>
          <br />
        </>
      ) : (
        <>
          <Link href={link}>
            <Button
              className={classes.button}
              startIcon={ICON}
              color="inherit"
              size="large"
              variant="outlined"
              disabled={disabled}>
              {label}
            </Button>
          </Link>
          <br />
        </>
      )}
    </>
  );
};

export default QuickActionComponent;

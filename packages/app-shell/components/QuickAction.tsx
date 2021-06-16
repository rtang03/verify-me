import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddToPhotosOutlinedIcon from '@material-ui/icons/AddToPhotosOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
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
      '&:hover': {
        color: dark ? grey[900] : grey[100],
        backgroundColor: dark ? grey[100] : grey[900],
      },
    },
  });
});

const QuickActionComponent: React.FC<{
  icon?: any;
  label: string;
  link: string;
  disabled: boolean;
}> = ({ icon, label, link, disabled }) => {
  const classes = useStyles();
  const ICON = {
    ['edit' as string]: <EditOutlinedIcon />,
    send: <SendOutlinedIcon />,
  }[icon] || <AddToPhotosOutlinedIcon />;

  return (
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
  );
};

export default QuickActionComponent;

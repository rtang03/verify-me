import Button from '@material-ui/core/Button';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddToPhotosOutlinedIcon from '@material-ui/icons/AddToPhotosOutlined';
import Link from 'next/link';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
      width: '25ch',
      flexWarp: 'wrap'
    },
    icon: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const QuickActionComponent: React.FC<{ label: string; link: string; disabled: boolean }> = ({
  label,
  link,
  disabled,
}) => {
  const classes = useStyles();

  return (
    <>
      <Link href={link}>
        <Button
          className={classes.margin}
          startIcon={<AddToPhotosOutlinedIcon />}
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

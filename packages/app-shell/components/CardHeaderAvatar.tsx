import Avatar from '@material-ui/core/Avatar';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';

  return createStyles({
    cardHeaderAvatar: {
      color: dark ? grey[50] : grey[900],
      backgroundColor: dark ? grey[800] : grey[50],
    },
  });
});

const CardHeaderAvatar: React.FC<any> = ({ children }) => {
  const classes = useStyles();

  return (
    <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
      {children}
    </Avatar>
  );
};

export default CardHeaderAvatar;

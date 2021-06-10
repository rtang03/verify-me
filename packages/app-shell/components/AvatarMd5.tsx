import Avatar from '@material-ui/core/Avatar';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import md5 from 'md5';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  })
);

const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';
const uri = (subject: string, size: number) => `${GRAVATAR_URI}${md5(subject)}?s=${size}&d=wavatar`;

const AvatarMd5: React.FC<{ subject: string; size?: 'small' | 'large' }> = ({ subject, size }) => {
  const classes = useStyles();

  if (size === 'small') return <Avatar src={uri(subject, 200)} className={classes.small} />;
  if (size === 'large') return <Avatar src={uri(subject, 400)} className={classes.large} />;

  return <Avatar src={uri(subject, 200)} />;
};

export default AvatarMd5;

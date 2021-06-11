import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IIdentifier } from '@veramo/core';
import md5 from 'md5';
import Link from 'next/link';
import React from 'react';
import { TenantInfo } from '../types';

const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';
const uri = (subject: string, size: number) => `${GRAVATAR_URI}${md5(subject)}?s=${size}&d=wavatar`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 545,
      display: 'flex',
      margin: theme.spacing(3, 1, 2),
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    media: {
      height: 120,
      width: 120,
    },
  })
);

const IdentifierCard: React.FC<{ identifier: IIdentifier; tenantInfo: TenantInfo }> = ({
  identifier,
  tenantInfo,
}) => {
  const classes = useStyles();
  const { did, alias } = identifier;

  return (
    <Card variant="outlined" className={classes.root}>
      <CardMedia className={classes.media} image={uri(did, 100)} />
      <div className={classes.details}>
        <CardContent>
          {alias?.includes('users:') && (
            <Link href={`/dashboard/${tenantInfo.id}/users/${alias}`}>
              <a>
                <Typography variant="caption">{alias}</Typography>
              </a>
            </Link>
          )}
          {!alias?.includes('users:') && (
            <Link href={`/dashboard/${tenantInfo.id}/identifiers`}>
              <a>
                <Typography variant="caption">{alias}</Typography>
              </a>
            </Link>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default IdentifierCard;

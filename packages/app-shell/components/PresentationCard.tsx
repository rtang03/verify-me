import CardMedia from '@material-ui/core/CardMedia';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { VerifiablePresentation } from '@verify/server';
import md5 from 'md5';
import Link from 'next/link';
import React from 'react';
import type { TenantInfo } from '../types';
import Presentation from './Presentation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { display: 'flex', margin: theme.spacing(3, 1, 2) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '55ch',
      },
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(0.5),
      width: '55ch',
    },
    media: {
      height: 220,
      width: 220,
    },
  })
);
const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';
const uri = (subject: string, size: number) =>
  `${GRAVATAR_URI}${md5(subject)}?s=${size}&d=identicon`;

const PresentationCard: React.FC<{
  tenantInfo: TenantInfo;
  vp: VerifiablePresentation;
  hash: string;
}> = ({ tenantInfo, vp, hash }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Link href={`/dashboard/${tenantInfo.id}/presentations/${hash}`}>
        <a>
          <CardMedia className={classes.media} image={uri(hash, 200)} />
        </a>
      </Link>
      <div className={classes.details}>
        <Presentation vp={vp} compact={true} />
      </div>
    </div>
  );
};

export default PresentationCard;

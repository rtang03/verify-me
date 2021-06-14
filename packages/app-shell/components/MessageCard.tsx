import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import type { IMessage } from '@veramo/core';
import md5 from 'md5';
import Link from 'next/link';
import React from 'react';
import { TenantInfo } from '../types';
import RawContent from './RawContent';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { display: 'flex', margin: theme.spacing(3, 1, 2) },
    full: { margin: theme.spacing(3, 1, 2) },
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
      height: 250,
      width: 250,
    },
  })
);
const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';
const uri = (subject: string, size: number) =>
  `${GRAVATAR_URI}${md5(subject)}?s=${size}&d=robohash`;

const TextField: React.FC<{
  value: string | undefined;
  label: string;
  icon?: React.ReactFragment;
}> = ({ value, label, icon }) => {
  const classes = useStyles();

  return (
    <MuiTextField
      className={classes.muiTextField}
      disabled={true}
      size="small"
      label={label}
      value={value}
      InputProps={
        icon && {
          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
        }
      }
    />
  );
};

const MessageCard: React.FC<{ isFull?: boolean; message: IMessage; tenantInfo: TenantInfo }> = ({
  isFull,
  message,
  tenantInfo,
}) => {
  const classes = useStyles();
  const { id, createdAt, from, to, metaData, type } = message;
  const getMessageType = (messageType: string) =>
    ({ 'w3c.vp': 'Presentation', sdr: 'SD Request', 'w3c.vc': 'Credential' }[messageType] ||
    'unknown type');

  return (
    <>
      <Card variant="outlined" className={classes.root}>
        <CardHeader
          action={
            <IconButton>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          }
        />
        {isFull && (
          <div>
            <TextField value={getMessageType(type)} label="Type" />
            <CardMedia className={classes.media} image={uri(id, 200)} />
          </div>
        )}
        {!isFull && (
          <Link href={`/dashboard/${tenantInfo.id}/messages/${id}`}>
            <a>
              <TextField value={getMessageType(type)} label="Type" />
              <CardMedia className={classes.media} image={uri(id, 200)} />
            </a>
          </Link>
        )}
        <div className={classes.details}>
          <TextField value={from} label="From" />
          <TextField value={to} label="To" />
          <TextField value={createdAt} label="CreatedAt" />
          {metaData?.map((item, index) => (
            <TextField key={index} value={JSON.stringify(item)} label="MetaData" />
          ))}
        </div>
      </Card>
      {isFull && (
        <Card variant="outlined" className={classes.full}>
          {message?.data && <RawContent title="Data" content={message.data} />}
        </Card>
      )}
    </>
  );
};

export default MessageCard;

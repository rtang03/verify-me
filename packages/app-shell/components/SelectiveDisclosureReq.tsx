import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LanguageIcon from '@material-ui/icons/Language';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import type { ISelectiveDisclosureRequest } from '@verify/server';
import React from 'react';

// data
//      iat
//      type: sdr
//      subject
//      claims: Claim[]
//      replyUrl
//      iss
// metaData
//      type: DIDComm
//      type: DiDComm
//      type: JWT value: ES256K

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '55ch',
      },
    },
  })
);

// SDR payload and metadata
const SelectiveDisclosureReq: React.FC<{ sdr: ISelectiveDisclosureRequest }> = ({ sdr }) => {
  const classes = useStyles();
  const { iat, iss, subject, claims, replyUrl } = sdr;

  return (
    <>
      <CardHeader subheader="Selective-disclosure-request payload" />
      <CardContent className={classes.muiTextField}>
        {iss && (
          <MuiTextField
            disabled={true}
            size="small"
            label="Issuer"
            defaultValue={iss}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationCityIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        <br />
        {subject && (
          <MuiTextField
            disabled={true}
            size="small"
            label="Subject"
            defaultValue={subject}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
        )}
        <br />
        {iat && (
          <MuiTextField
            disabled={true}
            size="small"
            label="Issuance Date / Time"
            defaultValue={new Date(iat * 1000).toISOString()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TodayIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        <br />
        {replyUrl && (
          <MuiTextField
            disabled={true}
            size="small"
            label="reply-Url"
            defaultValue={replyUrl}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      </CardContent>
    </>
  );
};

export default SelectiveDisclosureReq;

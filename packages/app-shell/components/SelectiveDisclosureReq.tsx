import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LabelIcon from '@material-ui/icons/Label';
import LabelOffIcon from '@material-ui/icons/LabelOff';
import LanguageIcon from '@material-ui/icons/Language';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import type { ISelectiveDisclosureRequest } from '@verify/server';
import React, { Fragment } from 'react';

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
      <CardHeader title="Selective-disclosure-request payload" />
      <CardContent className={classes.muiTextField}>
        {iss && (
          <MuiTextField
            disabled={true}
            size="small"
            label="Issuer"
            value={iss}
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
            value={subject}
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
            value={new Date(iat * 1000).toISOString()}
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
            value={replyUrl}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        <Card variant="outlined">
          {claims.map((claim, index) => (
            <Fragment key={index}>
              <CardHeader
                avatar={
                  claim.essential ? (
                    <Tooltip title="Mandatory">
                      <LabelIcon />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Optional">
                      <LabelOffIcon />
                    </Tooltip>
                  )
                }
                title={claim.claimType.toUpperCase()}
              />
              <CardContent className={classes.muiTextField}>
                {claim?.issuers?.map((issuer, index) => (
                  <MuiTextField
                    key={index}
                    disabled={true}
                    size="small"
                    label="Required issuer"
                    value={issuer.did}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationCityIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                ))}
                <br />
                <MuiTextField
                  key={index}
                  disabled={true}
                  size="small"
                  label="Reason"
                  value={claim.reason}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LiveHelpIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </CardContent>
            </Fragment>
          ))}
        </Card>
      </CardContent>
    </>
  );
};

export default SelectiveDisclosureReq;

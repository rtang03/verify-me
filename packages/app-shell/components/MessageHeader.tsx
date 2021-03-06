import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LanguageIcon from '@material-ui/icons/Language';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import { format } from 'date-fns';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '55ch',
      },
    },
  })
);
const pattern = "d.M.yyyy HH:mm:ss 'GMT' XXX (z)";

const MessageHeader: React.FC<{ from?: string; to?: string; createdAt?: string; url?: string }> = ({
  from,
  to,
  createdAt,
  url,
}) => {
  const classes = useStyles();

  return (
    <>
      <CardHeader className={classes.root} title="Message Info" />
      <CardContent className={classes.muiTextField}>
        {from && (
          <>
            <MuiTextField
              disabled={true}
              size="small"
              label="From"
              value={from}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCityIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
          </>
        )}
        {to && (
          <>
            <MuiTextField
              disabled={true}
              size="small"
              label="To"
              value={to}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            <br />
          </>
        )}
        {createdAt && (
          <>
            <MuiTextField
              disabled={true}
              size="small"
              label="Date"
              value={format(new Date(createdAt), pattern)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TodayIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
          </>
        )}
        {url && (
          <>
            <MuiTextField
              disabled={true}
              size="small"
              label="Url"
              value={url}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
          </>
        )}
      </CardContent>
    </>
  );
};

export default MessageHeader;

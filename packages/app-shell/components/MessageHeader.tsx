import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import React from 'react';

const MessageHeader: React.FC<{ from?: string; to?: string; issuanceDate?: string }> = ({
  from,
  to,
  issuanceDate,
}) => {
  return (
    <>
      {from && (
        <MuiTextField
          disabled={true}
          size="small"
          label="From"
          defaultValue={from}
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
      {to && (
        <MuiTextField
          disabled={true}
          size="small"
          label="To"
          defaultValue={to}
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
      {issuanceDate && (
        <MuiTextField
          disabled={true}
          size="small"
          label="Issuance date"
          defaultValue={issuanceDate}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TodayIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
    </>
  );
};

export default MessageHeader;

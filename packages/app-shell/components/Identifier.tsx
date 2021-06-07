import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import LanguageIcon from '@material-ui/icons/Language';
import SendIcon from '@material-ui/icons/Send';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import type { IIdentifier } from '@veramo/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: '60ch',
    },
  })
);
const Identifier: React.FC<{ identifier: IIdentifier }> = ({ identifier }) => {
  const classes = useStyles();
  return (
    <>
      <MuiTextField
        className={classes.root}
        disabled={true}
        size="small"
        label="Alias"
        defaultValue={identifier.alias}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AlternateEmailIcon />
            </InputAdornment>
          ),
        }}
      />
      <br />
      <MuiTextField
        className={classes.root}
        disabled={true}
        size="small"
        label="DID"
        defaultValue={identifier.did}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          ),
        }}
      />
      <br />
      <MuiTextField
        className={classes.root}
        disabled={true}
        size="small"
        label="Provider"
        defaultValue={identifier.provider}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LanguageIcon />
            </InputAdornment>
          ),
        }}
      />
      <br />
      {identifier.keys.map((key, index) => (
        <MuiTextField
          key={index}
          className={classes.root}
          disabled={true}
          size="small"
          label="Public Key"
          defaultValue={key.publicKeyHex}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKeyIcon />
              </InputAdornment>
            ),
          }}
        />
      ))}
      <br />
      {!!identifier?.services?.length &&
        identifier.services.map(({ type, serviceEndpoint }, index) => (
          <MuiTextField
            key={index}
            className={classes.root}
            disabled={true}
            size="small"
            label={type}
            defaultValue={serviceEndpoint}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SendIcon />
                </InputAdornment>
              ),
            }}
          />
        ))}
    </>
  );
};

export default Identifier;

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import type { DidDocument } from '@verify/server';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    field: {
      width: '100%',
    },
  })
);

const VerificationMethod: React.FC<{ methods: DidDocument['verificationMethod'] }> = ({
  methods,
}) => {
  const classes = useStyles();

  return (
    <>
      {methods?.map((verificationMethod) => (
        <Card variant="outlined" className={classes.root} key={verificationMethod.id}>
          <CardContent>
            <MuiTextField
              className={classes.field}
              disabled={true}
              size="small"
              label="Id"
              value={verificationMethod.id}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FingerprintOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
            <MuiTextField
              className={classes.field}
              disabled={true}
              size="small"
              label="Controller"
              value={verificationMethod.controller}
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
              className={classes.field}
              disabled={true}
              size="small"
              label={`Public Key / ${verificationMethod.type}`}
              value={verificationMethod.publicKeyHex}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default VerificationMethod;

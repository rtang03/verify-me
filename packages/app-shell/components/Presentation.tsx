import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import CategoryIcon from '@material-ui/icons/Category';
import ExtensionIcon from '@material-ui/icons/Extension';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import type { VerifiablePresentation } from '@verify/server';
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

const Presentation: React.FC<{ vp: Partial<VerifiablePresentation> }> = ({ vp }) => {
  const classes = useStyles();
  const { holder, verifier, issuanceDate, verifiableCredential: vcs } = vp;

  return (
    <CardContent className={classes.muiTextField}>
      {holder && (
        <>
          <MuiTextField
            disabled={true}
            size="small"
            label="Holder"
            value={holder}
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
      {verifier && (
        <>
          <MuiTextField
            disabled={true}
            size="small"
            label="Verifier"
            value={verifier}
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
      {issuanceDate && (
        <>
          <MuiTextField
            disabled={true}
            size="small"
            label="Issuance Date / Time"
            value={issuanceDate}
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
      <br />
      {vcs?.map((vc, index) => (
        <Card variant="outlined" key={index}>
          <CardHeader className={classes.root} subheader="Credentials" />
          <CardContent>
            <MuiTextField
              disabled={true}
              size="small"
              label="Issuer"
              value={vc.issuer?.id}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCityIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
            <MuiTextField
              disabled={true}
              size="small"
              label="Type"
              value={JSON.stringify(vc.type, null, 2)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
            <MuiTextField
              disabled={true}
              size="small"
              label="Issuance Date / Time"
              value={vc.issuanceDate}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TodayIcon />
                  </InputAdornment>
                ),
              }}
            />
            <br />
          </CardContent>
          <CardContent>
            <Card className={classes.root} variant="outlined">
              <CardHeader className={classes.root} subheader="Credential Subjects" />
              <CardContent>
                {Object.entries<string>(vc.credentialSubject).map(([key, value], index) => (
                  <>
                    <MuiTextField
                      key={index}
                      disabled={true}
                      size="small"
                      label={key}
                      value={value}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ExtensionIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <br />
                  </>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      ))}
    </CardContent>
  );
};

export default Presentation;

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import CategoryIcon from '@material-ui/icons/Category';
import ExtensionIcon from '@material-ui/icons/Extension';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import type { VerifiableCredential } from '@verify/server';
import { format } from 'date-fns';
import React from 'react';
import CardHeaderAvatar from './CardHeaderAvatar';

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

const Credential: React.FC<{ vc: VerifiableCredential; compact?: boolean }> = ({ vc, compact }) => {
  const classes = useStyles();
  const { issuer, type, issuanceDate } = vc;

  return (
    <React.Fragment>
      {!compact && (
        <CardHeader
          className={classes.root}
          avatar={
            <CardHeaderAvatar>
              <BallotOutlinedIcon />
            </CardHeaderAvatar>
          }
          title="Verifiable Credential"
        />
      )}
      <CardContent className={classes.muiTextField}>
        <MuiTextField
          className={classes.root}
          disabled={true}
          size="small"
          label="Issuer"
          defaultValue={issuer.id}
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
          label="Issuance Date"
          value={format(new Date(issuanceDate), pattern)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TodayIcon />
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
      </CardContent>
      {!compact && (
        <CardContent>
          <Card variant="outlined">
            <CardHeader subheader="Credential subjects" />
            <CardContent className={classes.muiTextField}>
              {Object.entries<string>(vc.credentialSubject).map(([key, value], index) => (
                <React.Fragment key={index}>
                  <MuiTextField
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
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      )}
    </React.Fragment>
  );
};

export default Credential;

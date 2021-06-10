import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import CategoryIcon from '@material-ui/icons/Category';
import ExtensionIcon from '@material-ui/icons/Extension';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import type { VerifiableCredential } from '@verify/server';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '55ch',
      },
    },
  })
);

const Credential: React.FC<{ vc: VerifiableCredential }> = ({ vc }) => {
  const classes = useStyles();
  const { issuer, type, issuanceDate } = vc;

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={
          <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
            <BallotOutlinedIcon />
          </Avatar>
        }
        title="Verifiable Credential"
      />
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
      <CardContent>
        <Card variant="outlined">
          <CardHeader subheader="Credential subjects" />
          <CardContent className={classes.muiTextField}>
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
  );
};

export default Credential;

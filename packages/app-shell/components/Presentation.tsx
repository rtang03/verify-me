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
import ScreenShareOutlinedIcon from '@material-ui/icons/ScreenShareOutlined';
import TodayIcon from '@material-ui/icons/Today';
import type { VerifiablePresentation } from '@verify/server';
import { format } from 'date-fns';
import React from 'react';
import CardHeaderAvatar from './CardHeaderAvatar';
import RawContent from './RawContent';
import AvatarMd5 from './AvatarMd5';

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

const Presentation: React.FC<{
  vp: Partial<VerifiablePresentation>;
  compact?: boolean;
  show?: boolean;
  id?: string;
}> = ({ vp, compact, show, id }) => {
  const classes = useStyles();
  const { holder, verifier, issuanceDate, verifiableCredential: vcs } = vp;

  return (
    <>
      {!compact && (
        <CardHeader
          className={classes.root}
          avatar={
            <CardHeaderAvatar>
              {id ? <AvatarMd5 subject={id} image="identicon" /> : <ScreenShareOutlinedIcon />}
            </CardHeaderAvatar>
          }
          title="Verifiable Presentation"
        />
      )}
      <CardContent>
        {holder && (
          <div className={classes.muiTextField}>
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
          </div>
        )}
        {verifier && (
          <div className={classes.muiTextField}>
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
          </div>
        )}
        {issuanceDate && (
          <div className={classes.muiTextField}>
            <MuiTextField
              disabled={true}
              size="small"
              label="Issuance Date / Time"
              value={format(new Date(issuanceDate), pattern)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TodayIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        )}
      </CardContent>
      {!compact && (
        <CardContent>
          {vcs?.map((vc, index) => (
            <Card className={classes.root} variant="outlined" key={index}>
              <CardHeader className={classes.root} subheader={`Credential #${index + 1}`} />
              <CardContent>
                <div className={classes.muiTextField}>
                  <MuiTextField
                    disabled={true}
                    size="small"
                    label="Issuer"
                    value={vc?.issuer?.id}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationCityIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className={classes.muiTextField}>
                  <MuiTextField
                    disabled={true}
                    size="small"
                    label="Type"
                    value={JSON.stringify(vc?.type, null, 2)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className={classes.muiTextField}>
                  <MuiTextField
                    disabled={true}
                    size="small"
                    label="Issuance Date / Time"
                    // TODO: Review me
                    value={vc?.issuanceDate}
                    // value={format(new Date(vc.issuanceDate), pattern)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TodayIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </CardContent>
              <CardContent>
                <Card className={classes.root} variant="outlined">
                  <CardHeader className={classes.root} subheader="Credential Subjects" />
                  <CardContent>
                    {Object.entries<string>(vc?.credentialSubject).map(([key, value], index) => (
                      <div key={index} className={classes.muiTextField}>
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
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ))}
          {show && <RawContent title="Raw VP" content={vp} />}
        </CardContent>
      )}
    </>
  );
};

export default Presentation;

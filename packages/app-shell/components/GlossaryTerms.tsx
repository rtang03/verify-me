import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return createStyles({
    root: {
      color: dark ? grey[100] : grey[700],
      'font-weight': 'bold',
    },
  });
});

export const TERMS = {
  did: 'DID',
  serviceEndpoint: 'Service Endpoint',
  verificationMethod: 'Verification Method',
};

const getTerm = (term: string) =>
  ({
    [TERMS.did]: 'Decentralized Identity; currently only web-method is supported.',
    [TERMS.serviceEndpoint]: 'Service endpoint is used to send and receive Did-Comm message',
    [TERMS.verificationMethod]: 'Also known as public key',
  }[term] || 'Unknown');

const GlossaryTerms: React.FC<{ terms: string[] }> = ({ terms }) => {
  const classes = useStyles();

  return (
    <>
      {terms
        .sort()
        .map<[string, string]>((term) => [term, getTerm(term)])
        .map(([term, details], index) => (
          <p key={index}>
            <Typography className={classes.root} color="inherit" variant="body2">
              {term}
            </Typography>
            <Typography color="inherit" variant="caption">
              {details}
            </Typography>
            <br />
          </p>
        ))}
    </>
  );
};

export default GlossaryTerms;

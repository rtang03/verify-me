import CardContent from '@material-ui/core/CardContent';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CategoryIcon from '@material-ui/icons/Category';
import LanguageIcon from '@material-ui/icons/Language';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import React from 'react';

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
const ServiceEndpoint: React.FC<{
  id: string;
  type: string;
  url: string;
  description?: string;
}> = ({ id, type, description, url }) => {
  const classes = useStyles();

  return (
    <CardContent className={classes.muiTextField}>
      <MuiTextField
        disabled={true}
        size="small"
        label="Id"
        value={id}
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
        value={type}
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
        label="Service Endpoint"
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
    </CardContent>
  );
};

export default ServiceEndpoint;

import util from 'util';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { prettyLog } from '../utils';

const ErrorComponent: React.FC<{ error?: any }> = ({ error }) => {
  if (error) prettyLog('Error', util.format('%j', error), false, true);

  return (
    <div>
      <Typography variant="h6" color="secondary">
        Oops, something bad happens.
      </Typography>
    </div>
  );
};

export default ErrorComponent;

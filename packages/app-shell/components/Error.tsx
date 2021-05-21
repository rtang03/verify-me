import Typography from '@material-ui/core/Typography';
import React from 'react';

const ErrorComponent: React.FC<any> = () => (
  <div>
    <Typography variant="h6" color="secondary">
      Oops, something bad happens.
    </Typography>
  </div>
);

export default ErrorComponent;

import Typography from '@material-ui/core/Typography';
import React from 'react';

const NoRecord: React.FC<unknown> = () => {
  return (
    <div>
      <Typography variant="body1" color="primary">
        No record found.
      </Typography>
    </div>
  );
};

export default NoRecord;

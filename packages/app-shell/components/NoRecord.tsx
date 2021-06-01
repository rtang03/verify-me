import Typography from '@material-ui/core/Typography';
import React from 'react';

const NoRecord: React.FC<unknown> = () => {
  return (
    <div>
      <Typography variant="h6" color="primary">
        No records found.
      </Typography>
    </div>
  );
};

export default NoRecord;

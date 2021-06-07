import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const NoRecord: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <CardContent>
      {title && <Typography variant="body2">{title}</Typography>}
      <br />
      <Typography variant="body1" color="primary">
        No record found.
      </Typography>
    </CardContent>
  );
};

export default NoRecord;

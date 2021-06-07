import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import JSONTree from 'react-json-tree';

const RawContent: React.FC<{ title?: string; content: any }> = ({ content, title }) => {
  return (
    <CardContent>
      {title && <Typography variant="caption">{title}</Typography>}
      {content && <JSONTree data={content} hideRoot={true} />}
    </CardContent>
  );
};

export default RawContent;

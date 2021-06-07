import Typography from '@material-ui/core/Typography';
import React from 'react';
import packageJson from '../../../package.json';

const Version: React.FC<{
  versionOnly?: boolean;
}> = ({ versionOnly }) => (
  <>
    <Typography variant="caption">v{packageJson.version}</Typography>
    {!versionOnly && (
      <Typography variant="caption">
        <b>License:</b> {packageJson.license}
      </Typography>
    )}
  </>
);

export default Version;

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/ExitToApp';
import Link from 'next/link';
import React from 'react';
import type { TenantInfo } from '../types';

const GotoIdentifier: React.FC<{ tenantInfo: TenantInfo; alias: string }> = ({
  tenantInfo,
  alias,
}) => (
  <>
    <br />
    <Typography variant="body2">
      <>
        <Link href={`/dashboard/${tenantInfo.id}/users/${alias}`}>
          <a>
            <IconButton>
              <LinkIcon />
            </IconButton>
          </a>
        </Link>
        {alias}
      </>
    </Typography>
  </>
);

export default GotoIdentifier;

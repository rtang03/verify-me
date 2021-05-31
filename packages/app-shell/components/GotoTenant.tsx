import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/ExitToApp';
import Link from 'next/link';
import React from 'react';
import type { TenantInfo } from '../types';

const GotoTenant: React.FC<{ tenantInfo: TenantInfo }> = ({ tenantInfo }) => (
  <>
    <br />
    <Typography variant="body1">
      <>
        The current tenant &quot;{tenantInfo.slug}&quot; is NOT activated; please go-to
        <Link href={`/dashboard/${tenantInfo.id}`}>
          <a>
            <IconButton>
              <LinkIcon />
            </IconButton>
          </a>
        </Link>
      </>
    </Typography>
  </>
);

export default GotoTenant;

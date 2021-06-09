import IconButton from '@material-ui/core/IconButton';
import LinkIcon from '@material-ui/icons/ExitToApp';
import Link from 'next/link';
import React from 'react';
import type { TenantInfo } from '../types';
import ProTip from './ProTip';

const GotoTenant: React.FC<{ tenantInfo: TenantInfo }> = ({ tenantInfo }) => (
  <>
    <ProTip
      text={
        <>
          {`The current tenant "${tenantInfo.slug}" is NOT activated; please go-to`}{' '}
          <Link href={`/dashboard/${tenantInfo.id}`}>
            <a>
              <IconButton>
                <LinkIcon />
              </IconButton>
            </a>
          </Link>
        </>
      }
    />
  </>
);

export default GotoTenant;

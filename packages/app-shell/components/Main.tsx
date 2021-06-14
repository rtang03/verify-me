import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Session } from 'next-auth';
import Link from 'next/link';
import React from 'react';
import type { TenantInfo } from '../types';
import AccessDenied from './AccessDenied';
import Error from './Error';
import GotoTenant from './GotoTenant';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  })
);

const Main: React.FC<{
  session: Session;
  parentUrl?: string;
  parentText?: string;
  title: string;
  subtitle?: string;
  isLoading: boolean;
  isError?: boolean;
  shouldActivate?: boolean;
  tenantInfo?: TenantInfo | null;
}> = ({
  children,
  session,
  parentUrl,
  parentText,
  title,
  subtitle,
  isLoading,
  isError,
  shouldActivate,
  tenantInfo,
}) => {
  const classes = useStyles();

  return (
    <>
      {session && (
        <>
          {parentUrl && parentText && (
            <>
              <Link href={parentUrl}>
                <a>
                  <Typography variant="caption">← Back to {parentText}</Typography>
                </a>
              </Link>
              <br />
              <br />
            </>
          )}
          <Typography variant="h5">{title}</Typography>
          {subtitle && <Typography variant="caption">{subtitle}</Typography>}
          <br />
          <br />
          <Divider />
          <Backdrop className={classes.backdrop} open={isLoading}>
            <CircularProgress color="inherit" />
          </Backdrop>
          {isError && <Error />}
          {shouldActivate && tenantInfo && !tenantInfo.activated && (
            <GotoTenant tenantInfo={tenantInfo} />
          )}
          <br />
          {children}
        </>
      )}
      {!session && <AccessDenied />}
    </>
  );
};

export default Main;

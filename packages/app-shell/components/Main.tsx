import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { Session } from 'next-auth';
import Link from 'next/link';
import React from 'react';
import AccessDenied from './AccessDenied';

const Main: React.FC<{
  session: Session;
  parentUrl?: string;
  parentText?: string;
  title: string;
  subtitle?: string;
  isLoading: boolean;
}> = ({ children, session, parentUrl, parentText, title, subtitle, isLoading }) => {
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
          <Typography variant="h4">{title}</Typography>
          {subtitle && <Typography variant="caption">{subtitle}</Typography>}
          <br />
          <br />
          {isLoading ? <LinearProgress /> : <Divider />}
          {children}
        </>
      )}
      {!session && <AccessDenied />}
    </>
  );
};

export default Main;

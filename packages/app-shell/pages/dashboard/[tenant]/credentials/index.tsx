import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import CredentialCard from 'components/CredentialCard';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import NoRecord from 'components/NoRecord';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { useNextAuthUser, usePagination, useQueryCredential, useTenant } from 'utils';

const pageSize = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const CredentialIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { cursor, pageChange } = usePagination(pageSize);

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Credentials
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const {
    count,
    isQueryCredentialError,
    isQueryCredentialLoading,
    paginatedCredential,
    queryCredentialError,
  } = useQueryCredential({ slug, pageSize, shouldFetch });

  return (
    <Layout title="Credentials" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="Credentials"
        subtitle="Issue verifiable credentials"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || (isQueryCredentialLoading && shouldFetch)}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isQueryCredentialError && !isQueryCredentialLoading && (
          <Error error={queryCredentialError} />
        )}
        {tenantInfo?.activated && (
          <QuickAction
            tooltip="Create verifiable credential"
            link={`/dashboard/${tenantInfo?.id}/credentials/issue`}
            label="1"
            disabled={!tenantInfo?.id}
          />
        )}
        {tenantInfo?.activated && !!paginatedCredential?.items?.length && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={
                <CardHeaderAvatar>
                  <BallotOutlinedIcon />
                </CardHeaderAvatar>
              }
              title="Credentials"
              subheader={<>Total: {paginatedCredential?.total || 0}</>}
            />
            <Pagination
              variant="outlined"
              shape="rounded"
              count={count}
              showFirstButton
              showLastButton
              onChange={pageChange}
            />
            <CardContent>
              {paginatedCredential.items.map(({ verifiableCredential, hash }, index) => (
                <Card variant="outlined" className={classes.root} key={index}>
                  <CredentialCard hash={hash} tenantInfo={tenantInfo} vc={verifiableCredential} />
                  {show && (
                    <RawContent
                      title="Raw Credential"
                      content={omit(verifiableCredential, 'proof', '@context', 'type')}
                    />
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
        {tenantInfo && !paginatedCredential?.items?.length && !isQueryCredentialLoading && (
          <NoRecord />
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default CredentialIndexPage;

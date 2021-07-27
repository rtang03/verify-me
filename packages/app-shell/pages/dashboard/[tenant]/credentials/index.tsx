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
import type { PaginatedVerifiableCredential } from 'types';
import { useNextAuthUser, usePagination, useReSWR, useTenant } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const CredentialIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { cursor, pageChange } = usePagination(PAGESIZE);

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Credentials
  // TODO: need to refine the where-clause
  const args = { where: [{ column: 'subject', op: 'IsNull', not: true }] };
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug
    ? `/api/credentials?slug=${slug}&cursor=${cursor}&pagesize=${PAGESIZE}&args=${JSON.stringify(
        args
      )}`
    : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedVerifiableCredential>(
    url,
    shouldFetch
  );
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Credentials" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        session={session}
        title="Credentials"
        subtitle="Issue verifiable credentials"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || (isLoading && shouldFetch)}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && (
          <QuickAction
            link={`/dashboard/${tenantInfo?.id}/credentials/issue`}
            label="1"
            disabled={!tenantInfo?.id}
          />
        )}
        {tenantInfo?.activated && !!data?.items?.length && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              avatar={
                <CardHeaderAvatar>
                  <BallotOutlinedIcon />
                </CardHeaderAvatar>
              }
              title="Active credentials"
              subheader={<>Total: {data?.total || 0}</>}
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
              {data.items.map(({ verifiableCredential, hash }, index) => (
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
        {tenantInfo && !data?.items?.length && !isLoading && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default CredentialIndexPage;

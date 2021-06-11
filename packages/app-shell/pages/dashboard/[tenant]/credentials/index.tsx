import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import NoRecord from 'components/NoRecord';
import QuickAction from 'components/QuickAction';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import Link from 'next/link';
import React from 'react';
import JSONTree from 'react-json-tree';
import type { PaginatedVerifiableCredential } from 'types';
import { usePagination, useReSWR, useTenant } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const CredentialIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { cursor, pageChange } = usePagination(PAGESIZE);

  // Query Credentials
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug ? `/api/credentials?slug=${slug}&cursor=${cursor}&pagesize=${PAGESIZE}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedVerifiableCredential>(
    url,
    shouldFetch
  );
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Credentials">
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
            <Pagination count={count} showFirstButton showLastButton onChange={pageChange} />
            <CardContent>
              {data.items.map(({ verifiableCredential, hash }, index) => (
                <Card key={index} className={classes.root} variant="outlined">
                  <Link href={`/dashboard/${tenantInfo.id}/credentials/${hash}`}>
                    <a>
                      <CardHeader
                        avatar={<AvatarMd5 subject={hash} />}
                        title={verifiableCredential.credentialSubject.id}
                        subheader={verifiableCredential.issuanceDate}
                      />
                    </a>
                  </Link>
                  <CardContent>
                    <JSONTree
                      data={omit(verifiableCredential, 'proof', '@context', 'type')}
                      hideRoot={true}
                    />
                  </CardContent>
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

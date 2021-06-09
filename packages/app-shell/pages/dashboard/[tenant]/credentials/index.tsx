import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
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
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    inline: { display: 'inline' },
  })
);

const CredentialIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { pageIndex, pageChange } = usePagination(PAGESIZE);

  // Query Credentials
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug
    ? `/api/credentials?slug=${slug}&cursor=${pageIndex * PAGESIZE}&pagesize=${PAGESIZE}`
    : null;
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
        isError={tenantError && !tenantLoading}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        {tenantInfo?.activated && !!data?.items?.length && (
          <>
            <QuickAction
              link={`/dashboard/${tenantInfo?.id}/credentials/issue`}
              label="Credential"
              disabled={!tenantInfo?.id}
            />
            <Card className={classes.root}>
              <CardHeader title="Active credentials" subheader={<>Total: {data?.total || 0}</>} />
              <Pagination count={count} showFirstButton showLastButton onChange={pageChange} />
              <br />
              <CardContent>
                <List className={classes.root}>
                  {data.items.map(({ verifiableCredential, hash }, index) => (
                    <ListItem key={index}>
                      <Card className={classes.root} variant="outlined">
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
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </>
        )}
        {tenantInfo && !data?.items?.length && !isLoading && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default CredentialIndexPage;

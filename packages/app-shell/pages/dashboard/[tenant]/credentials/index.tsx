import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
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
import { useRouter } from 'next/router';
import React, { Fragment, useState } from 'react';
import JSONTree from 'react-json-tree';
import type { PaginatedTenant, PaginatedVerifiableCredential } from 'types';
import { getTenantInfo, useReSWR } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: '100ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: { display: 'inline' },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const router = useRouter();
  const tenantId = router.query.tenant as string;

  // Query TenantInfo
  const {
    data: tenant,
    isError: tenantError,
    isLoading: tenantLoading,
  } = useReSWR<PaginatedTenant>(`/api/tenants?id=${tenantId}`, tenantId !== '0');
  const tenantInfo = getTenantInfo(tenant);
  const slug = tenantInfo?.slug;

  // handle PageChange upon pagination
  const [pageIndex, setPageIndex] = useState(0);
  const handlePageChange = (event: React.ChangeEvent<unknown>, pagenumber: number) =>
    setPageIndex((pagenumber - 1) * PAGESIZE);

  // Query Credentials
  const url = slug
    ? `/api/credentials?slug=${slug}&cursor=${pageIndex * PAGESIZE}&pagesize=${PAGESIZE}`
    : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedVerifiableCredential>(url, !!slug);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Credentials">
      <Main
        session={session}
        title="Credentials"
        subtitle="Issue verifiable credentials"
        parentText={`Dashboard/${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || isLoading}>
        <QuickAction
          link={`/dashboard/${tenantInfo?.id}/credentials/issue`}
          label="+ Issue Credential"
          disabled={!tenantInfo?.id}
        />
        {tenantError && !tenantLoading && <Error />}
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        <br />
        {tenantInfo?.activated && !!data?.items?.length && (
          <Card className={classes.root}>
            <CardHeader title="Active credentials" subheader={<>Total: {data?.total || 0}</>} />
            <Pagination count={count} showFirstButton showLastButton onChange={handlePageChange} />
            <br />
            <CardContent>
              <List className={classes.root}>
                {data.items.map(({ verifiableCredential, hash }, index) => (
                  <Fragment key={index}>
                    <ListItem>
                      <Card>
                        <CardHeader
                          avatar={<AvatarMd5 subject={hash} />}
                          title={verifiableCredential.issuer.id}
                          subheader={verifiableCredential.issuanceDate}
                        />
                        <CardContent>
                          <JSONTree
                            data={omit(verifiableCredential, 'proof', '@context', 'type')}
                            hideRoot={true}
                          />
                        </CardContent>
                      </Card>
                    </ListItem>
                    <Divider variant="inset" />
                  </Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        {tenantInfo && !data?.items?.length && <NoRecord />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

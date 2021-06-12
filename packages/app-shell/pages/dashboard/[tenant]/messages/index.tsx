import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
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
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import type { PaginatedMessage } from 'types';
import { usePagination, useReSWR, useTenant } from 'utils';
import RawContent from '../../../../components/RawContent';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const MessagesIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const { cursor, pageChange } = usePagination(PAGESIZE);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Messages
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug ? `/api/messages?slug=${slug}&cursor=${cursor}&pagesize=${PAGESIZE}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedMessage>(url, shouldFetch);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  return (
    <Layout title="Messages" shouldShow={[show, setShow]}>
      <Main
        session={session}
        title="Inbox"
        subtitle="Incoming messages. Learn more"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || (isLoading && shouldFetch)}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {isError && !isLoading && <Error error={error} />}
        {tenantInfo?.activated && (
          <QuickAction
            link={`/dashboard/${tenantInfo?.id}/messages`}
            label="Credential"
            icon="send"
            disabled={!tenantInfo?.id}
          />
        )}
        {tenantInfo?.activated && !!data?.items?.length && (
          <Card className={classes.root}>
            <CardHeader
              className={classes.root}
              title="Messages"
              subheader={<>Total: {data?.total || 0}</>}
              avatar={
                <CardHeaderAvatar>
                  <EmailOutlinedIcon />
                </CardHeaderAvatar>
              }
            />
            <Pagination count={count} showFirstButton showLastButton onChange={pageChange} />
            <CardContent>
              {data &&
                data.items.map((item, index) => (
                  <Card key={index} className={classes.root} variant="outlined">
                    <Link href={`/dashboard/${tenantInfo.id}/messages/${item.id}`}>
                      <a>
                        <CardHeader
                          className={classes.root}
                          avatar={<AvatarMd5 subject={item.to || 'idle'} />}
                          title={`subject: ${item.to}`}
                          subheader={`Type: "${item.type}" at ${item.createdAt} `}
                        />
                      </a>
                    </Link>
                    {show && item.type === 'w3c.vc' && (
                      <RawContent
                        content={item?.credentials?.map((cred) =>
                          omit(cred, '@context', 'proof', 'type')
                        )}
                      />
                    )}
                    {show && item.type === 'sdr' && (
                      <RawContent
                        content={omit(item, 'type', 'raw', 'id', 'metaData', 'createdAt')}
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

export default MessagesIndexPage;

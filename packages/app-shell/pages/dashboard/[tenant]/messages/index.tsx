import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import Pagination from '@material-ui/lab/Pagination';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import MessageCard from 'components/MessageCard';
import NoRecord from 'components/NoRecord';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import omit from 'lodash/omit';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { Fragment, useState } from 'react';
import type { PaginatedMessage } from 'types';
import { useNextAuthUser, usePagination, useReSWR, useTenant } from 'utils';

const PAGESIZE = 5;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const MessagesIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session?.user?.id);

  // Pagination
  const { cursor, pageChange } = usePagination(PAGESIZE);

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Query Messages
  const shouldFetch = !!slug && !!tenantInfo?.activated;
  const url = slug ? `/api/messages?slug=${slug}&cursor=${cursor}&pagesize=${PAGESIZE}` : null;
  const { data, isLoading, isError, error } = useReSWR<PaginatedMessage>(url, shouldFetch);
  let count;
  data && !isLoading && (count = Math.ceil(data.total / PAGESIZE));

  // Delete Message
  const deleteMessage = () => {
    return null;
  };

  return (
    <Layout title="Messages" shouldShow={[show, setShow]} user={activeUser}>
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
            icon="request"
            link={`/dashboard/${tenantInfo?.id}/messages/createsdr`}
            label="SD Request"
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
            <Pagination
              variant="outlined"
              shape="rounded"
              count={count}
              showFirstButton
              showLastButton
              onChange={pageChange}
            />
            <CardContent>
              {data &&
                data.items.map((item, index) => (
                  <Fragment key={index}>
                    <MessageCard message={item} tenantInfo={tenantInfo} />
                    {show && item.type === 'w3c.vc' && (
                      <RawContent
                        content={item?.credentials?.map((cred) => omit(cred, '@context', 'type'))}
                      />
                    )}
                    {show && item.type === 'w3c.vp' && (
                      <RawContent
                        content={item?.presentations?.map((presentation) =>
                          omit(presentation, '@context', 'type')
                        )}
                      />
                    )}
                    {show && item.type === 'sdr' && <RawContent content={omit(item, 'type')} />}
                  </Fragment>
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

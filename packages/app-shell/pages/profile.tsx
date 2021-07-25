import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import { withAuth } from 'components';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import { Session } from 'next-auth';
import React from 'react';
import JSONTree from 'react-json-tree';
import useSWR from 'swr';
import type { CommonResponse, UserInfo } from 'types';
import { useNextAuthUser } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { data, error } = useSWR<CommonResponse<UserInfo>>('/api/userinfo');

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session.user.id);

  return (
    <Layout title="Profile" user={activeUser}>
      <Main session={session} title="User profile" isLoading={!data}>
        {!!data && (
          <>
            <Card className={classes.root}>
              <CardHeader
                className={classes.root}
                avatar={<Avatar src={data?.data?.image || 'idle'} />}
                subheader={data?.data?.name}
                action={
                  <IconButton>
                    <EditOutlinedIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <JSONTree data={data?.data} hideRoot={true} />
              </CardContent>
            </Card>
          </>
        )}
        {!!error && <Error />}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

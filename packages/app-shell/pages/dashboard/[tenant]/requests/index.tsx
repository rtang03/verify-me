import { withAuth } from 'components';
import Layout from 'components/Layout';
import Main from 'components/Main';
import QuickAction from 'components/QuickAction';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { useTenant } from 'utils';

const RequestIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  return (
    <Layout title="Request">
      <Main
        session={session}
        title="Selective Disclosure Request"
        subtitle="Send new request"
        parentText={`Dashboard | ${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && (
          <>
            <QuickAction
              icon="send"
              link={`/dashboard/${tenantInfo?.id}/requests/create`}
              label="Request"
              disabled={!tenantInfo?.id}
            />
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default RequestIndexPage;

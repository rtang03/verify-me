import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IIdentifier } from '@veramo/core';
import { withAuth } from 'components';
import Error from 'components/Error';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Success from 'components/Success';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import JSONTree from 'react-json-tree';
import { mutate } from 'swr';
import type { PaginatedTenant, TenantInfo } from 'types';
import { getTenantInfo, getTenantUrl, useFetcher, useReSWR } from 'utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { maxWidth: 550, margin: theme.spacing(3, 1, 2) },
    submit: { margin: theme.spacing(3, 2, 2) },
  })
);

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const classes = useStyles();
  const tenantId = router.query.tenant as string;

  // Query TenantInfo
  const {
    data: tenant,
    isError: tenantError,
    isLoading: tenantLoading,
  } = useReSWR<PaginatedTenant>('/api/tenants', tenantId, tenantId !== '0');
  const tenantInfo = getTenantInfo(tenant);
  const fqUrl = tenantInfo?.slug && domain && getTenantUrl(tenantInfo?.slug, domain);
  const nonFqUrl = fqUrl?.replace('https://', '').replace('http://', '');

  // Query Web Did
  const url = tenantInfo?.slug ? `/api/identifiers/did-json?slug=${tenantInfo.slug}` : null;
  const { data, isLoading, error: didError } = useReSWR(url, undefined, !!tenantInfo?.slug);

  // Create Web Did
  const { val: webDid, poster } = useFetcher<IIdentifier>();
  const newDid = async (body: { alias: string }) =>
    mutate(url, poster(`/api/identifiers/create?slug=${tenantInfo?.slug}`, body));

  return (
    <Layout title="Identifiers">
      <Main
        session={session}
        title="Web Identifier"
        subtitle="Setup decentralized identity for web. Each tenant can have only one web did-document."
        parentText={`Dashboard/${tenantInfo?.slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}>
        {tenantLoading || isLoading ? <LinearProgress /> : <Divider />}
        {(tenantError || didError) && <Error />}
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        {tenantInfo?.activated && !data && !didError && (
          <>
            <br />
            <Typography variant="body2">Web-identifier URL: {nonFqUrl}</Typography>
            {!webDid?.data && (
              <>
                <br />
                <Typography variant="caption">
                  ⚠️ No Decentralized Identity Document Found. You are about to create one, with
                  web-method.
                </Typography>
                <br />
              </>
            )}
            <Formik
              initialValues={{}}
              onSubmit={async (_, { setSubmitting }) => {
                setSubmitting(true);
                await newDid({ alias: nonFqUrl as string }).then(() => setSubmitting(false));
              }}>
              {({ isSubmitting }) => (
                <Form>
                  <p>
                    <Button
                      className={classes.submit}
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={isSubmitting || !fqUrl || !!webDid?.data}
                      type="submit">
                      + Create Web Identifier
                    </Button>
                  </p>
                </Form>
              )}
            </Formik>
          </>
        )}
        {tenantInfo?.activated && data && (
          <>
            <br />
            <Typography variant="body2">Tenant&apos;s URL: {fqUrl}</Typography>
            <br />
            <Typography variant="h5">Identity</Typography>
            <JSONTree theme="bright" data={data} hideRoot={true} />
          </>
        )}
        {webDid?.data && (
          <>
            <br />
            <Divider />
            <Success />
            <Typography variant="caption" color="primary">
              {webDid?.data.did} is created.
            </Typography>
          </>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

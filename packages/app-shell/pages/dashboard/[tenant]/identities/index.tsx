import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import { green } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ReceiptIcon from '@material-ui/icons/Receipt';
import type { IIdentifier, IDIDManagerGetOrCreateArgs } from '@veramo/core';
import type { DidDocument } from '@verify/server';
import { withAuth } from 'components';
import GotoTenant from 'components/GotoTenant';
import Layout from 'components/Layout';
import Main from 'components/Main';
import QuickAction from 'components/QuickAction';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { mutate } from 'swr';
import { getTenantUrl, useFetcher, useReSWR, useTenant } from 'utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { maxWidth: 550, margin: theme.spacing(3, 1, 2) },
    submit: { margin: theme.spacing(3, 2, 2) },
    green: {
      color: '#fff',
      backgroundColor: green[500],
    },
  })
);

const IdentifiersIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const fqUrl = tenantInfo?.slug && domain && getTenantUrl(tenantInfo?.slug, domain);
  const nonFqUrl = fqUrl?.replace('https://', '').replace('http://', '');

  // Query Web Did
  const url = slug ? `/api/identifiers/did-json?slug=${slug}` : null;
  const { data, isLoading, error: didError } = useReSWR<DidDocument>(url, !!slug);

  // Create Web Did
  const { val: webDid, poster } = useFetcher<IIdentifier>();
  const newDid = async (body: IDIDManagerGetOrCreateArgs) =>
    mutate(url, poster(`/api/identifiers/create?slug=${slug}`, body));

  return (
    <Layout title="Identifiers">
      <Main
        session={session}
        title="Web Identifier"
        subtitle="Setup decentralized identity for web. Each tenant can have only one web did-document."
        parentText={`Dashboard/${slug}`}
        parentUrl={`/dashboard/${tenantInfo?.id}`}
        isLoading={tenantLoading || isLoading}
        isError={tenantError || didError}>
        {tenantInfo && !tenantInfo.activated && <GotoTenant tenantInfo={tenantInfo} />}
        {tenantInfo?.activated && !data && !isLoading && !didError && (
          <Formik
            initialValues={{}}
            onSubmit={async (_, { setSubmitting }) => {
              setSubmitting(true);
              await newDid({ alias: nonFqUrl as string }).then(() => setSubmitting(false));
            }}>
            {({ isSubmitting }) => (
              <Form>
                <Typography variant="body2">Web-identifier URL: {nonFqUrl}</Typography>
                {!webDid?.data && (
                  <>
                    <br />
                    <Typography variant="body2">
                      ⚠️ No Decentralized Identity Document Found. You are about to create one, with
                      web-method.
                    </Typography>
                    <br />
                  </>
                )}
                <p>
                  <Button
                    className={classes.submit}
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={isSubmitting || !fqUrl || !!webDid?.data}
                    type="submit">
                    + Create Web Identifier
                  </Button>
                </p>
              </Form>
            )}
          </Formik>
        )}
        {tenantInfo?.activated && data && (
          <Card>
            <CardHeader
              avatar={
                <Avatar className={classes.green}>
                  <ReceiptIcon />
                </Avatar>
              }
              title="Did Document"
              subheader={<>Your URL: {fqUrl}</>}
            />
            <CardContent>
              <CardHeader title="DID" subheader={data?.id} />
              <CardHeader
                title="Verification method"
                subheader={`${data?.verificationMethod?.length} record(s) found`}
              />
              <CardHeader
                title="Service endpoint"
                subheader={
                  data?.service?.length === 0 ? (
                    <>No records found</>
                  ) : (
                    <>{`${data?.service?.length} record(s) found`}</>
                  )
                }
              />
            </CardContent>
            {data?.service?.length === 0 && (
              <CardContent>
                <CardActions>
                  <QuickAction
                    label="Service endpoint"
                    link={`/dashboard/${tenantInfo.id}/identifiers/service`}
                    disabled={false}
                  />
                </CardActions>
              </CardContent>
            )}
            <RawContent title="Raw Did Document" content={data} />
          </Card>
        )}
        <Result isTenantExist={!!tenantInfo} result={webDid} />
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersIndexPage;

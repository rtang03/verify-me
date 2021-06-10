import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { DidDocument } from '@verify/server';
import { withAuth } from 'components';
import AddServiceEndpoint from 'components/AddServiceEndpoint';
import Layout from 'components/Layout';
import Main from 'components/Main';
import RemoveServiceEndpoint from 'components/RemoveServiceEndpoint';
import ServiceEndpoint from 'components/ServiceEndpoint';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React from 'react';
import { useReSWR, useTenant } from 'utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

const IdentifiersServicePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Query Web Did
  const url = slug ? `/api/identifiers/did-json?slug=${slug}` : null;
  const { data: didDoc, isLoading, error: didError } = useReSWR<DidDocument>(url, !!slug);
  const services = didDoc?.service;

  return (
    <Layout title="DID Document">
      <Main
        session={session}
        title="DID Document"
        subtitle={tenantInfo?.slug?.toUpperCase()}
        parentUrl={`/dashboard/${tenantInfo?.id}/identifiers`}
        parentText="Did Document"
        isLoading={tenantLoading || isLoading}
        isError={tenantError || didError}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {tenantInfo?.activated && didDoc && services && !isLoading && !didError && (
          <Card className={classes.root}>
            {/*** Remove Service Endpoint ***/}
            {services?.length > 0 &&
              services.map((service, index) => (
                <RemoveServiceEndpoint
                  key={index}
                  service={service}
                  didDoc={didDoc}
                  url={url}
                  tenantInfo={tenantInfo}
                />
              ))}
            {services?.length > 0 && (
              <CardContent>
                {services.map(({ id, type, serviceEndpoint }, index) => (
                  <ServiceEndpoint key={index} id={id} type={type} url={serviceEndpoint} />
                ))}
              </CardContent>
            )}
            {/*** Add Service Endpoint ***/}
            {services?.length === 0 && didDoc && (
              <AddServiceEndpoint tenantInfo={tenantInfo} did={didDoc.id} url={url} />
            )}
          </Card>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default IdentifiersServicePage;

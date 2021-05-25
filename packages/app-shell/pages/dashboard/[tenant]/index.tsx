import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import Switch from '@material-ui/core/Switch';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { withAuth } from 'components';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Success from 'components/Success';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import pick from 'lodash/pick';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useState, useEffect } from 'react';
import { mutate } from 'swr';
import { useCommonResponse, useFetcher } from 'utils';
import * as yup from 'yup';
import type { PaginatedTenant } from '../../../types';

const baseUrl = '/api/tenants';
const validation = yup.object({ name: yup.string().nullable() });
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { maxWidth: 550, margin: theme.spacing(3, 1, 2) },
    textField: { width: '45ch' },
    submit: { margin: theme.spacing(3, 2, 2) },
    activate: {
      marginLeft: 'auto',
    },
  })
);

type PsqlUpdated = {
  affected: number;
};

type TenantInfo = {
  id?: string;
  slug?: string;
  name?: string;
  activated?: boolean;
  members?: any;
  updated_at?: string;
};

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const classes = useStyles();

  // Query TenantInfo
  const { data, isError, isLoading } = useCommonResponse<PaginatedTenant>(
    '/api/tenants',
    router.query.tenant as string
  );
  const tenantInfo: TenantInfo | null = data
    ? pick(data.items[0], 'id', 'slug', 'name', 'activated', 'members', 'updated_at')
    : null;

  // First time activation


  // Update Tenant
  const { val: updateResult, updater } = useFetcher<PsqlUpdated>();
  const updateTenant = async (body: any) =>
    mutate(`${baseUrl}?id=${tenantInfo?.id}`, updater(`${baseUrl}?id=${tenantInfo?.id}`, body));

  // Edit Mode
  const [editMode, setEdit] = useState(false);
  const handleEdit = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => setEdit(checked);

  return (
    <Layout title="Tenant">
      <Main
        title={data?.items?.[0].slug || 'Tenant details'}
        subtitle={data?.items?.[0].name || ''}
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard">
        {isLoading ? <LinearProgress /> : <Divider />}
        {isError && !isLoading && <Error />}
        <Divider />
        {/* IF NOT ACTIVATE */}
        {!!tenantInfo && !tenantInfo.activated && (
          <Formik
            initialValues={{}}
            onSubmit={() => {
              console.log(null);
            }}>
            {({ isSubmitting }) => (
              <>
                <Card className={classes.root} variant="outlined">
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" component="p">
                      This tenant is not activated. Please sign below term-and-conditions to
                      activate. You are about to use no-fee beta service.
                    </Typography>
                  </CardContent>
                  <CardActions disableSpacing>
                    <Button
                      className={classes.submit}
                      color="primary"
                      disabled={isSubmitting}
                      type="submit"
                      variant="contained">
                      Activate
                    </Button>
                  </CardActions>
                </Card>
              </>
            )}
          </Formik>
        )}
        {/* IF ACTIVATE */}
        {!!tenantInfo && tenantInfo.activated && (
          <Formik
            initialValues={{ name: tenantInfo.name, enabled: false }}
            validateOnChange={true}
            validationSchema={validation}
            onSubmit={async ({ name }, { setSubmitting }) => {
              setSubmitting(false);
              await updateTenant({ name });
              setSubmitting(true);
              setEdit(false);
            }}>
            {({ values, errors, isSubmitting }) => (
              <Form>
                <Card className={classes.root} variant="outlined">
                  <CardHeader
                    avatar={<AvatarMd5 subject={tenantInfo.id || 'no id'} />}
                    title={tenantInfo.slug}
                    subheader={`Last: ${tenantInfo.updated_at}`}
                    action={
                      <FormControlLabel
                        control={<Switch checked={editMode} onChange={handleEdit} name="edit" />}
                        label={editMode ? 'Edit' : 'Locked'}
                      />
                    }
                  />
                  <CardContent>
                    <Field
                      className={classes.textField}
                      component={TextField}
                      disabled={!editMode}
                      fullwidth="true"
                      label="Description"
                      margin="normal"
                      name={'name'}
                      placeholder={'a user-friendly description or name'}
                      size="small"
                      variant="outlined"
                    />
                  </CardContent>
                  <CardActions disableSpacing>
                    <Button
                      className={classes.submit}
                      color="primary"
                      disabled={!editMode || isSubmitting}
                      type="submit"
                      variant="contained">
                      Save
                    </Button>
                  </CardActions>
                  <CardContent>
                    <Divider />
                    <br />
                    {updateResult?.data?.affected === 1 && !updateResult.loading && <Success />}
                    {updateResult?.error && !updateResult.loading && <Error />}
                  </CardContent>
                </Card>
              </Form>
            )}
          </Formik>
        )}
      </Main>
    </Layout>
  );
};

export const getServerSideProps = withAuth;

export default Page;

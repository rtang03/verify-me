import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { withAuth } from 'components';
import Activation from 'components/Activation';
import AvatarMd5 from 'components/AvatarMd5';
import Error from 'components/Error';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { ChangeEvent, useState } from 'react';
import { mutate } from 'swr';
import { useFetcher, useTenant } from 'utils';
import * as yup from 'yup';

const baseUrl = '/api/tenants';
const validation = yup.object({ name: yup.string().nullable() });
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '45ch' },
    submit: { margin: theme.spacing(3, 2, 2) },
    activate: {
      marginLeft: 'auto',
    },
  })
);

type PsqlUpdated = { affected: number };

const TenantIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

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
        title={slug || 'Tenant details'}
        subtitle={tenantInfo?.name || ''}
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard"
        isLoading={tenantLoading}>
        {tenantError && !tenantLoading && <Error error={tenantError} />}
        {/* IF NOT ACTIVATE */}
        {!!tenantInfo && !tenantInfo.activated && <Activation tenantInfo={tenantInfo} />}
        {/* IF ACTIVATE */}
        {!!tenantInfo && tenantInfo.activated && (
          <Formik
            initialValues={{ name: tenantInfo.name || '', enabled: false }}
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
                <Card className={classes.root}>
                  <CardHeader
                    avatar={<AvatarMd5 subject={tenantInfo.id || 'no id'} />}
                    title={tenantInfo.slug?.toUpperCase()}
                    subheader={`Last updated: ${tenantInfo.updated_at}`}
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
                      disabled={!editMode || isSubmitting || !!errors?.name || !values.name}
                      type="submit"
                      variant="contained">
                      Save
                    </Button>
                  </CardActions>
                  <Result isTenantExist={!!tenantInfo} result={updateResult} />
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

export default TenantIndexPage;

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import { withAuth } from 'components';
import Activation from 'components/Activation';
import AvatarMd5 from 'components/AvatarMd5';
import Layout from 'components/Layout';
import Main from 'components/Main';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { ChangeEvent, useState } from 'react';
import { mutate } from 'swr';
import { useFetcher, useActiveTenant, useTenant, useNextAuthUser } from 'utils';
import * as yup from 'yup';

const baseUrl = '/api/tenants';
const validation = yup.object({ name: yup.string().nullable() });
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '45ch' },
    button: {
      '&:hover': {
        'font-weight': 'bold',
      },
    },
  })
);

type PsqlUpdated = { affected: number };

const TenantIndexPage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();

  // activeUser will pass active_tenant to Layout.ts
  const { activeUser } = useNextAuthUser(session.user.id);

  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();

  // Used for "Set Active"
  const { activeTenant, updateActiveTenant } = useActiveTenant(activeUser?.active_tenant);

  // Update Tenant
  const { val: updateResult, updater } = useFetcher<PsqlUpdated>();
  const updateTenant = async (body: any) => {
    await updater(`${baseUrl}?id=${tenantInfo?.id}`, body);
    await mutate(`${baseUrl}?id=${tenantInfo?.id}`);
  };

  // Edit Mode
  const [editMode, setEdit] = useState(false);
  const handleEdit = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => setEdit(checked);

  const isActiveTenant = tenantInfo?.id === activeTenant?.id;

  // Show Raw Content
  const [show, setShow] = useState(false);

  return (
    <Layout title="Tenant" shouldShow={[show, setShow]} user={activeUser}>
      <Main
        title={slug?.toUpperCase() || 'Tenant details'}
        subtitle={tenantInfo?.name || 'Tenant profile'}
        session={session}
        parentText="Dashboard"
        parentUrl="/dashboard"
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}>
        {!!tenantInfo && !isActiveTenant && (
          <>This is not default tenant. Please switch to {tenantInfo?.slug?.toUpperCase()}</>
        )}
        {/* IF NOT ACTIVATE */}
        {!!tenantInfo && isActiveTenant && !tenantInfo.activated && (
          <Activation tenantInfo={tenantInfo} show={show}/>
        )}
        {/* IF ACTIVATE */}
        {!!tenantInfo && isActiveTenant && tenantInfo.activated && (
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
            {({ values, errors, isSubmitting, submitForm }) => (
              <Form>
                <Card className={classes.root}>
                  <CardHeader
                    className={classes.root}
                    title="About"
                    action={
                      tenantInfo?.id &&
                      tenantInfo?.slug && (
                        <Button
                          className={classes.button}
                          size="small"
                          color="inherit"
                          disabled={activeTenant?.id === tenantInfo.id}
                          onClick={async () =>
                            updateActiveTenant(session.user.id as string, tenantInfo.id as string)
                          }>
                          {activeTenant?.id === tenantInfo.id ? 'Default' : 'Set Default'}
                        </Button>
                      )
                    }
                  />
                  <CardHeader
                    className={classes.root}
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
                    <SubmitButton
                      tooltip="Save"
                      text={<SaveOutlinedIcon />}
                      submitForm={submitForm}
                      loading={isSubmitting}
                      success={!!updateResult?.data}
                      error={!!updateResult?.error}
                      disabled={!editMode || isSubmitting || !!errors?.name || !values.name}
                    />
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

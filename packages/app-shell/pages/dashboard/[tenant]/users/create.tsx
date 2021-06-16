import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { grey } from '@material-ui/core/colors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import type { IIdentifier, IDIDManagerGetOrCreateArgs } from '@veramo/core';
import { withAuth } from 'components';
import CardHeaderAvatar from 'components/CardHeaderAvatar';
import Error from 'components/Error';
import GotoIdentifier from 'components/GotoIdentifier';
import Layout from 'components/Layout';
import LowerCaseTextField from 'components/LowerCaseTextField';
import Main from 'components/Main';
import RawContent from 'components/RawContent';
import Result from 'components/Result';
import SubmitButton from 'components/SubmitButton';
import { Form, Field, Formik } from 'formik';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import React, { useState } from 'react';
import { mutate } from 'swr';
import { getTenantUrl, useFetcher, useTenant } from 'utils';
import * as yup from 'yup';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const validation = yup.object({
  username: yup
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(20, 'Must be less  than 20 characters')
    .required('Alias is required')
    .matches(/^[a-zA-Z0-9]+$/, 'Cannot contain special characters or spaces'),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    textField: { width: '40ch' },
    submit: { margin: theme.spacing(3, 3, 3) },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const UsersCreatePage: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const { tenantInfo, slug, tenantError, tenantLoading } = useTenant();
  const fqUrl = slug && domain && getTenantUrl(slug, domain);
  const nonFqUrl = fqUrl?.replace('https://', '').replace('http://', '');

  // Show Raw Content
  const [show, setShow] = useState(false);

  // Create User Identifier
  const { val: userDid, poster } = useFetcher<IIdentifier>();

  return (
    <Layout title="User" shouldShow={[show, setShow]}>
      <Main
        session={session}
        title="Create User"
        parentUrl={`/dashboard/${tenantInfo?.id}/users`}
        parentText={`User-Identifiers`}
        isLoading={tenantLoading}
        isError={tenantError && !tenantLoading}
        tenantInfo={tenantInfo}
        shouldActivate={true}>
        {userDid.error && <Error error={userDid.error} />}
        {tenantInfo?.activated && (
          <Formik
            initialValues={{ username: '' }}
            validateOnChange={true}
            validationSchema={validation}
            onSubmit={async ({ username }, { setSubmitting }) => {
              setSubmitting(true);
              const key = slug ? `/api/users/${username}?slug=${slug}` : null;
              const newUser = (body: IDIDManagerGetOrCreateArgs) =>
                mutate(key, poster(`/api/tenants/didManagerCreate?slug=${slug}`, body));
              await newUser({ alias: `${nonFqUrl}:users:${username}` }).then(() =>
                setSubmitting(false)
              );
            }}>
            {({ values: { username }, isSubmitting, errors, submitForm }) => (
              <Form>
                <Card className={classes.root}>
                  <CardHeader
                    className={classes.root}
                    title="User identifier"
                    subheader={
                      <Typography variant="caption">
                        Only lower-case and numeric are allowed; special characters and space
                        disabled
                      </Typography>
                    }
                    avatar={
                      <CardHeaderAvatar>
                        <PersonAddIcon />
                      </CardHeaderAvatar>
                    }
                  />
                  <CardContent>
                    <Typography variant="caption" color="inherit">
                      You are {username ? `"did:web:${nonFqUrl}:users:${username}"` : '...'}
                    </Typography>
                    <Divider />
                    <br />
                    <Field
                      disabled={!!userDid?.data}
                      className={classes.textField}
                      label="Alias for User Identiifier"
                      size="small"
                      component={LowerCaseTextField}
                      name={'username'}
                      placeholder={'a short memorable name'}
                      variant="outlined"
                      margin="normal"
                      fullwidth="true"
                      autoFocus={true}
                    />
                  </CardContent>
                  <CardActions>
                    <SubmitButton
                      tooltip="Create user"
                      text={<PlusOneIcon />}
                      submitForm={submitForm}
                      loading={isSubmitting}
                      success={!!userDid?.data}
                      error={!!userDid?.error}
                      disabled={isSubmitting || !!errors?.username || !username || !!userDid?.data}
                    />
                  </CardActions>
                  <Result isTenantExist={!!tenantInfo} result={userDid} />
                  {tenantInfo && userDid?.data?.alias && !userDid.loading && (
                    <CardContent>
                      <GotoIdentifier tenantInfo={tenantInfo} alias={userDid.data.alias} />{' '}
                    </CardContent>
                  )}
                  {show && userDid?.data && (
                    <RawContent title="Raw Create user result" content={userDid?.data} />
                  )}
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

export default UsersCreatePage;

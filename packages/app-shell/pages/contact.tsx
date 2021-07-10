import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Footer from 'components/Footer';
import Layout from 'components/Layout';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/client';
import React from 'react';
import * as yup from 'yup';
import SendFab from '../components/SendFab';

const validation = yup.object({
  name: yup
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(20, 'Must be less  than 20 characters')
    .required('name is required'),
  email: yup.string().email().required('Email is required'),
  message: yup
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(300, 'Must be less  than 300 characters')
    .required('Message is required'),
});
const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';

  return createStyles({
    root: {
      flexGrow: 1,
    },
    card: {
      width: '55ch',
      textAlign: 'center',
      margin: theme.spacing(3, 1, 3),
    },
    textField: { width: '40ch' },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '40ch',
      },
    },
  });
});
const Index: NextPage<null> = () => {
  const classes = useStyles();
  const [session] = useSession();

  return (
    <Layout title="Contact">
      <div className={classes.root}>
        <Grid container spacing={3} direction="row" justify="center" alignItems="center">
          <Grid item xs={4}>
            <Card className={classes.card}>
              <Formik
                initialValues={{ name: '', email: '', message: '' }}
                validateOnChange={true}
                validationSchema={validation}
                onSubmit={async ({ name, email, message }, { setSubmitting }) => {
                  setSubmitting(true);
                  console.log('submit is clicked');
                  setSubmitting(false);
                }}>
                {({ values, errors, isSubmitting, submitForm }) => (
                  <Form>
                    <CardHeader
                      title="Contact Form"
                      action={
                        <SendFab
                          tooltip="Send message"
                          loading={isSubmitting}
                          disabled={
                            isSubmitting ||
                            !values?.name ||
                            !values?.email ||
                            !values?.message ||
                            !!errors?.name ||
                            !!errors?.email ||
                            !!errors.message
                          }
                          submitForm={submitForm}
                          success={false}
                          error={false}
                        />
                      }
                    />
                    <CardContent className={classes.card}>
                      <div className={classes.muiTextField}>
                        <Field
                          disabled={isSubmitting}
                          className={classes.textField}
                          label="name"
                          size="small"
                          component={TextField}
                          name={'name'}
                          placeholder={'name'}
                          variant="outlined"
                          margin="normal"
                          fullwidth="true"
                          autoFocus={true}
                        />
                      </div>
                      <div className={classes.muiTextField}>
                        <Field
                          disabled={isSubmitting}
                          className={classes.textField}
                          label="email"
                          size="small"
                          component={TextField}
                          name={'email'}
                          placeholder={'email'}
                          variant="outlined"
                          margin="normal"
                          fullwidth="true"
                        />
                      </div>
                      <div className={classes.muiTextField}>
                        <Field
                          disabled={isSubmitting}
                          className={classes.textField}
                          label="message"
                          size="small"
                          component={TextField}
                          name={'message'}
                          placeholder={'message'}
                          variant="outlined"
                          margin="normal"
                          fullwidth="true"
                          multiline
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Form>
                )}
              </Formik>
            </Card>
          </Grid>
        </Grid>
      </div>
      {/*** If not Login ***/}
      {!session?.user && <Footer />}
    </Layout>
  );
};

export default Index;

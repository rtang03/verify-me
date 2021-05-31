import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import React from 'react';
import { mutate } from 'swr';
import type { TenantInfo } from '../types';
import { useFetcher } from '../utils';
import Error from './Error';
import Success from './Success';

const baseUrl = '/api/tenants/actions';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { maxWidth: 550, margin: theme.spacing(3, 1, 2) },
    submit: { margin: theme.spacing(3, 2, 2) },
  })
);

// First time activation
const Activation: React.FC<{ tenantInfo: TenantInfo }> = ({ tenantInfo }) => {
  const classes = useStyles();
  const { val, poster } = useFetcher();

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, { setSubmitting }) => {
        setSubmitting(true);
        await mutate(
          `/api/tenants?id=${tenantInfo.id}`,
          poster(
            `${baseUrl}?id=${tenantInfo.id}&action=activate&slug=${tenantInfo.slug}`
          ).then(() => setSubmitting(false))
        );
      }}>
      {({ isSubmitting }) => (
        <Form>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography variant="body1" color="textSecondary" component="p">
                This tenant is not activated. Please sign below term-and-conditions to activate. You
                are about to use no-fee beta service.
              </Typography>
            </CardContent>
            <CardActions disableSpacing>
              <Button
                className={classes.submit}
                color="primary"
                disabled={isSubmitting || !!val?.data || !!val?.error || !tenantInfo}
                type="submit"
                variant="contained">
                Activate
              </Button>
            </CardActions>
            <CardContent>
              {val?.data === true && (
                <>
                  <Link href={`/dashboard/${tenantInfo.id}`}>
                    <a>
                      <Typography variant="body1">Go to {tenantInfo.slug}</Typography>
                    </a>
                  </Link>
                  <br />
                  <Success />
                </>
              )}
              {val?.data && <Success />}
              {val?.error && <Error />}
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default Activation;

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import React from 'react';
import { mutate } from 'swr';
import type { TenantInfo } from '../types';
import { useFetcher } from '../utils';
import ProTip from './ProTip';
import Result from './Result';

const baseUrl = '/api/tenants/actions';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
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
          <Card className={classes.root}>
            <CardContent>
              <ProTip text="This tenant is NOT activated. Please sign below term-and-conditions to activate. You
                are about to use no-fee beta service." />
            </CardContent>
            <CardActions>
              <Button
                className={classes.submit}
                color="inherit"
                size="large"
                disabled={isSubmitting || !!val?.data || !!val?.error || !tenantInfo?.id}
                type="submit"
                variant="outlined">
                Activate
              </Button>
            </CardActions>
            <Result isTenantExist={true} result={val} />
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default Activation;

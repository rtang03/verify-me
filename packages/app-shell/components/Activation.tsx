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
import SubmitButton from './SubmitButton';
import TermsCondition from './TermsCondition';

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
        await poster(`${baseUrl}?id=${tenantInfo.id}&action=activate&slug=${tenantInfo.slug}`);
        await mutate(`/api/tenants?id=${tenantInfo.id}`);
        setSubmitting(false);
      }}>
      {({ isSubmitting, submitForm }) => (
        <Form>
          <Card className={classes.root}>
            <CardContent className={classes.root}>
              <ProTip
                text={
                  <>
                    This tenant is NOT activated. Please read below terms and conditions to
                    activate. You are about to use no-fee beta service.
                    <CardContent>
                      <TermsCondition />
                    </CardContent>
                  </>
                }
              />
            </CardContent>
            <CardActions>
              <SubmitButton
                text={'Activate'}
                submitForm={submitForm}
                loading={isSubmitting}
                disabled={isSubmitting || !!val?.data || !!val?.error || !tenantInfo?.id}
                success={!!val?.data}
                error={!!val?.error}
              />
            </CardActions>
            <Result isTenantExist={true} result={val} />
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default Activation;

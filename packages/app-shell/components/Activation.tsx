import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/ExitToApp';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import React, { useState } from 'react';
import type { TenantInfo } from '../types';
import { useFetcher } from '../utils';
import ProTip from './ProTip';
import RawContent from './RawContent';
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
const Activation: React.FC<{ tenantInfo: TenantInfo; show: boolean }> = ({ tenantInfo, show }) => {
  const classes = useStyles();
  const { val, poster } = useFetcher();

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, { setSubmitting }) => {
        setSubmitting(true);
        await poster(`${baseUrl}?id=${tenantInfo.id}&action=activate&slug=${tenantInfo.slug}`);
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
                disabled={isSubmitting || val?.status === 'OK' || !!val?.error || !tenantInfo?.id}
                success={!!val?.data}
                error={!!val?.error}
              />
            </CardActions>
            <Result isTenantExist={true} result={val} />
            {show && <RawContent title="Result" content={val} />}
            {val?.status && !val?.loading && (
              <CardContent>
                <Typography variant="body2">
                  <>
                    <Link href={`/dashboard`}>
                      <a>
                        <IconButton>
                          <LinkIcon />
                        </IconButton>
                      </a>
                    </Link>
                    Go Back
                  </>
                </Typography>
              </CardContent>
            )}
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default Activation;

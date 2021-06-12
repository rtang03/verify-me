import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import type { IDIDManagerAddServiceArgs } from '@verify/server';
import ProTip from 'components/ProTip';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import { mutate } from 'swr';
import type { TenantInfo } from 'types';
import { getTenantUrl, useFetcher } from 'utils';
import * as yup from 'yup';
import Result from './Result';
import SubmitButton from './SubmitButton';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const secure = process.env.NEXT_PUBLIC_DOMAIN_SECURE === 'true';
const validation = yup.object({
  serviceEndpoint: yup.string().url().required('url is required'),
  description: yup.string(),
});
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    typeTextField: { width: '15ch' },
    serviceTextField: { width: '50ch' },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const AddServiceEndpoint: React.FC<{ tenantInfo: TenantInfo; did: string; url: string | null }> = ({
  tenantInfo,
  did,
  url,
}) => {
  const classes = useStyles();
  const { slug } = tenantInfo;
  const { val: addServiceEP, poster: add } = useFetcher<{ success: boolean }>();
  const newService = (body: IDIDManagerAddServiceArgs) =>
    mutate(url, add(`/api/tenants/didManagerAddService?slug=${slug}`, body));
  const defaultService = (slug && domain && `${getTenantUrl(slug, domain, secure)}`) || '';

  return (
    <Formik
      initialValues={{
        type: 'Messaging',
        description: '',
        serviceEndpoint: defaultService,
      }}
      validateOnChange={true}
      validationSchema={validation}
      onSubmit={async ({ type, serviceEndpoint, description }, { setSubmitting }) => {
        setSubmitting(true);
        const id = `service#${did}`;
        await newService({ did, service: { id, type, serviceEndpoint, description } }).then(() =>
          setSubmitting(false)
        );
      }}>
      {({ isSubmitting, submitForm, values: { serviceEndpoint }, errors }) => (
        <Form>
          <Card variant="outlined">
            <CardContent>
              <ProTip text="No service endpoint found. Please create one." />
            </CardContent>
            <CardHeader title="Add Service Endpoint" subheader="Used for Did-Comm Messaging" />
            <CardContent>
              <Field
                disabled={true}
                className={classes.typeTextField}
                label="Type"
                size="small"
                component={TextField}
                name={'type'}
                placeholder={'Messaging'}
                variant="outlined"
                margin="normal"
              />
              <br />
              <Field
                disabled={!!addServiceEP.data}
                className={classes.serviceTextField}
                label="Service endpoint *"
                size="small"
                component={TextField}
                name={'serviceEndpoint'}
                placeholder={'e.g. http://example.com'}
                variant="outlined"
                margin="normal"
                autoFocus={true}
              />
              <br />
              <Field
                disabled={!!addServiceEP.data}
                className={classes.serviceTextField}
                label="Description"
                size="small"
                component={TextField}
                name={'description'}
                placeholder={'Messaging Endpoint'}
                variant="outlined"
                margin="normal"
                autoFocus={true}
              />
            </CardContent>
            <CardActions>
              <SubmitButton
                text={<PlusOneIcon />}
                submitForm={submitForm}
                disabled={
                  isSubmitting ||
                  !!errors?.serviceEndpoint ||
                  !serviceEndpoint ||
                  !!addServiceEP?.data
                }
                loading={isSubmitting}
                success={!!addServiceEP?.data}
                error={!!addServiceEP?.error}
              />
            </CardActions>
            <Result isTenantExist={!!tenantInfo} result={addServiceEP} />
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default AddServiceEndpoint;

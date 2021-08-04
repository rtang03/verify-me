import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import type { ServiceEndpoint, IDIDManagerRemoveServiceArgs } from '@verify/server';
import { Form, Formik } from 'formik';
import React from 'react';
import { mutate } from 'swr';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import CardHeaderAvatar from './CardHeaderAvatar';
import ConfirmationDialog from './ConfirmationDialog';
import Result from './Result';

const useStyles = makeStyles((theme: Theme) => {
  const grey = theme.palette.grey;

  return createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  });
});

const RemoveServiceEndpoint: React.FC<{
  service: ServiceEndpoint;
  did: string;
  url: string | null;
  tenantInfo: TenantInfo;
}> = ({ service, did, url, tenantInfo }) => {
  const classes = useStyles();
  const { slug } = tenantInfo;

  // delete service endpoint
  const { val: removeServiceEP, poster: remove } = useFetcher<{ success: boolean }>();
  const removeService = async (body: IDIDManagerRemoveServiceArgs) => {
    await remove(`/api/tenants/didManagerRemoveService?slug=${slug}`, body);
    await mutate(url);
  };

  // form state
  const [openConfirm, setConfirmOpen] = React.useState(false);
  const handleOpen = () => setConfirmOpen(true);
  const handleClose = () => setConfirmOpen(false);

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, { setSubmitting }) => {
        setSubmitting(true);
        await removeService({ did, id: service.id });
        handleClose();
        setSubmitting(false);
      }}>
      {({ isSubmitting, submitForm }) => (
        <Form>
          <CardHeader
            className={classes.root}
            avatar={
              <CardHeaderAvatar>
                <LanguageIcon />
              </CardHeaderAvatar>
            }
            title="Service endpoint"
            subheader="Used for Did-Comm Messaging"
            action={
              <Tooltip title="Delete service endpoint">
                <IconButton onClick={handleOpen}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <ConfirmationDialog
            open={openConfirm}
            handleClose={handleClose}
            title="Confirm to delete?"
            content="After deletion, messages will no longer be sent / received."
            submitForm={submitForm}
            confirmDisabled={isSubmitting}
            loading={isSubmitting}
          />
          <Result isTenantExist={!!tenantInfo} result={removeServiceEP} />
        </Form>
      )}
    </Formik>
  );
};

export default RemoveServiceEndpoint;

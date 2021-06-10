import Avatar from '@material-ui/core/Avatar';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import type { ServiceEndpoint, DidDocument, IDIDManagerRemoveServiceArgs } from '@verify/server';
import { Form, Formik } from 'formik';
import React from 'react';
import { mutate } from 'swr';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import ConfirmationDialog from './ConfirmationDialog';
import Result from './Result';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    cardHeaderAvatar: {
      color: grey[900],
      backgroundColor: '#fff',
    },
  })
);

const RemoveServiceEndpoint: React.FC<{
  service: ServiceEndpoint;
  didDoc: DidDocument;
  url: string | null;
  tenantInfo: TenantInfo;
}> = ({ service, didDoc, url, tenantInfo }) => {
  const classes = useStyles();
  const { slug } = tenantInfo;

  // delete service endpoint
  const { val: removeServiceEP, poster: remove } = useFetcher<{ success: boolean }>();
  const removeService = (body: IDIDManagerRemoveServiceArgs) =>
    mutate(url, remove(`/api/tenants/didManagerRemoveService?slug=${slug}`, body));

  // form state
  const [openConfirm, setConfirmOpen] = React.useState(false);
  const handleOpen = () => setConfirmOpen(true);
  const handleClose = () => setConfirmOpen(false);

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, { setSubmitting }) => {
        setSubmitting(true);
        await removeService({ did: didDoc.id, id: service.id });
        handleClose();
        setSubmitting(false);
      }}>
      {({ isSubmitting, submitForm }) => (
        <Form>
          <CardHeader
            className={classes.root}
            avatar={
              <Avatar variant="rounded" className={classes.cardHeaderAvatar}>
                <LanguageIcon />
              </Avatar>
            }
            title="Service endpoint"
            subheader="Used for Did-Comm Messaging"
            action={
              <IconButton onClick={handleOpen}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
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

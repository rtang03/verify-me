import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IDIDManagerDeleteArgs } from '@verify/server';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import ConfirmationDialog from './ConfirmationDialog';
import ProTip from './ProTip';
import Result from './Result';

const useStyles = makeStyles((theme: Theme) => {
  const grey = theme.palette.grey;

  return createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    button: {
      color: 'white',
      backgroundColor: red[600],
      '&:hover': {
        color: red[500],
        backgroundColor: grey[300],
      },
    },
  });
});

const DeleteIdentifier: React.FC<{ tenantInfo: TenantInfo; did: string }> = ({
  tenantInfo,
  did,
}) => {
  const classes = useStyles();
  const router = useRouter();
  const { slug, id } = tenantInfo;

  // delete identifier
  const { val: result, poster } = useFetcher();
  const deleteIdentifier = (body: IDIDManagerDeleteArgs) =>
    poster(`/api/tenants/didManagerDelete?slug=${slug}`, body);

  // form state
  const [openConfirm, setConfirmOpen] = React.useState(false);
  const handleOpen = () => setConfirmOpen(true);
  const handleClose = () => setConfirmOpen(false);

  return (
    <>
      <ProTip
        text={
          <Formik
            initialValues={{}}
            onSubmit={async (_, { setSubmitting }) => {
              setSubmitting(true);
              await deleteIdentifier({ did });
              handleClose();
              setSubmitting(false);
              setTimeout(() => router.push(`/dashboard/${id}/users`), 3000);
            }}>
            {({ isSubmitting, submitForm }) => (
              <Form>
                <CardHeader
                  title={<Typography variant="body1">Danger Zone</Typography>}
                  subheader={
                    <Typography variant="body2">
                      Deleted Identitifer is irrecoverable. All issued claims will no longer be
                      validated.
                    </Typography>
                  }
                  action={
                    <Button
                      variant="outlined"
                      size="small"
                      className={classes.button}
                      onClick={handleOpen}>
                      DELETE
                    </Button>
                  }
                />
                <ConfirmationDialog
                  open={openConfirm}
                  handleClose={handleClose}
                  title="Confirm to delete?"
                  content="After deletion, this identitifer will be terminated permantly."
                  submitForm={submitForm}
                  confirmDisabled={isSubmitting}
                  loading={isSubmitting}
                />
              </Form>
            )}
          </Formik>
        }
        tipType="danger"
      />
      <Result isTenantExist={!!tenantInfo} result={result} />
    </>
  );
};

export default DeleteIdentifier;

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import CategoryIcon from '@material-ui/icons/Category';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExtensionIcon from '@material-ui/icons/Extension';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import TodayIcon from '@material-ui/icons/Today';
import type {
  VerifiableCredential,
  IDataStoreDeleteVerifiableCredentialArgs,
} from '@verify/server';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import React from 'react';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import CardHeaderAvatar from './CardHeaderAvatar';
import ConfirmationDialog from './ConfirmationDialog';
import Result from './Result';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
    muiTextField: {
      '& .MuiTextField-root': {
        margin: theme.spacing(0.5),
        width: '55ch',
      },
    },
  })
);
const pattern = "d.M.yyyy HH:mm:ss 'GMT' XXX (z)";

const Credential: React.FC<{
  vc: VerifiableCredential;
  // delete button will show only if "hash" exist
  hash?: string;
  tenantInfo: TenantInfo;
  compact?: boolean;
}> = ({ vc, compact, tenantInfo, hash }) => {
  const classes = useStyles();
  const { issuer, issuanceDate } = vc;
  const { slug } = tenantInfo;

  // form state for deleteCredential
  const [openConfirm, setConfirmOpen] = React.useState(false);
  const handleConfirmOpen = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);

  // Delete credential
  const { val: deleteVcResult, poster } = useFetcher<boolean>();
  const deleteCredential = async (body: IDataStoreDeleteVerifiableCredentialArgs) => {
    await poster(`/api/tenants/dataStoreDeleteVerifiableCredential?slug=${slug}`, body);
  };

  return (
    <React.Fragment>
      {!compact && (
        <Formik
          initialValues={{}}
          onSubmit={async (_, { setSubmitting }) => {
            setSubmitting(true);
            // BUG: TODO: https://github.com/uport-project/veramo/issues/649
            // Need to await this bug to fix, before uncommenting below line
            // hash && (await deleteCredential({ hash }));
            handleConfirmClose();
            setSubmitting(false);
          }}>
          {({ isSubmitting, submitForm }) => (
            <Form>
              <CardHeader
                className={classes.root}
                avatar={
                  <CardHeaderAvatar>
                    <BallotOutlinedIcon />
                  </CardHeaderAvatar>
                }
                title="Verifiable Credential"
                action={
                  hash && (
                    <Tooltip title="Delete credential">
                      <IconButton onClick={handleConfirmOpen}>
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }
              />
              <ConfirmationDialog
                open={openConfirm}
                handleClose={handleConfirmClose}
                title="Confirm to delete"
                content="After deletion, verifiable credential will no longer be retrieved."
                submitForm={submitForm}
                confirmDisabled={isSubmitting}
                loading={isSubmitting}
              />
              <Result isTenantExist={!!tenantInfo} result={deleteVcResult} />
              {deleteVcResult?.data && <pre>{JSON.stringify(deleteVcResult, null, 2)}</pre>}
            </Form>
          )}
        </Formik>
      )}
      <CardContent className={classes.muiTextField}>
        <MuiTextField
          className={classes.root}
          disabled={true}
          size="small"
          label="Issuer"
          defaultValue={issuer.id}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationCityIcon />
              </InputAdornment>
            ),
          }}
        />
        <br />
        <MuiTextField
          disabled={true}
          size="small"
          label="Issuance Date"
          value={format(new Date(issuanceDate), pattern)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TodayIcon />
              </InputAdornment>
            ),
          }}
        />
        <br />
        <MuiTextField
          disabled={true}
          size="small"
          label="Type"
          value={JSON.stringify(vc.type, null, 2)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CategoryIcon />
              </InputAdornment>
            ),
          }}
        />
      </CardContent>
      {!compact && (
        <CardContent>
          <Card variant="outlined">
            <CardHeader subheader="Credential subjects" />
            <CardContent className={classes.muiTextField}>
              {Object.entries<string>(vc.credentialSubject).map(([key, value], index) => (
                <React.Fragment key={index}>
                  <MuiTextField
                    disabled={true}
                    size="small"
                    label={key}
                    value={value}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ExtensionIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <br />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      )}
    </React.Fragment>
  );
};

export default Credential;

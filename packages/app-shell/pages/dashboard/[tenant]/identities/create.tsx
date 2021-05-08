import util from 'util';
import { createStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FileCopyOutlineIcon from '@material-ui/icons/FileCopyOutlined';
import AccessDenied from 'components/AccessDenied';
import Layout from 'components/Layout';
import { Form, Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import pick from 'lodash/pick';
import type { NextPage, NextPageContext } from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import Link from 'next/link';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import * as yup from 'yup';
import { createKeyPair } from 'utils';

interface State {
  did: string;
  address: string;
  publicKey: string;
  privateKey: string;
  didDocument: any;
  saveMode: boolean;
  copyPrivateKey: boolean;
  result: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: { width: '85ch' },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })
);

// field validation
const validation = yup.object({ description: yup.string().required().min(5) });

const Page: NextPage<{ session: Session }> = ({ session }) => {
  const classes = useStyles();
  const [values, setValues] = useState<State>({
    did: '',
    address: '',
    publicKey: '',
    privateKey: '',
    didDocument: null,
    saveMode: false,
    copyPrivateKey: false,
    result: null,
  });

  const handleKeyGen = () => setValues({ ...values, ...createKeyPair(), saveMode: false });
  const handleVerify = () => setValues({ ...values, saveMode: true });
  const handleClickCopyPrivKey = () => {
    setValues({ ...values, copyPrivateKey: !values.copyPrivateKey });
    return navigator.clipboard.writeText(values.privateKey);
  };
  const handleMouseDownPrivKey = (event: React.MouseEvent<HTMLButtonElement>) =>
    event.preventDefault();

  return (
    <Layout title="Identity">
      {session ? (
        <>
          <Link href="/dashboard/1/identities">
            <a>
              <Typography variant="caption">← Back to Identities</Typography>
            </a>
          </Link>
          <br />
          <br />
          <Typography variant="h5">Create Identity</Typography>
          <Typography variant="caption" color="secondary">
            Private key is generated at the client; will not be sent to server.
          </Typography>
          <br />
          {/* Button Group */}
          <Button disabled={values?.result} size="small" variant="contained">
            <a onClick={handleKeyGen}>
              {values.saveMode ? <>⌘ Re-generate It</> : <>⌘ Generate Keys</>}
            </a>
          </Button>{' '}
          <Button disabled={!values.did} size="small" variant="contained">
            <a onClick={handleVerify}>⇲ Verify Did Document</a>
          </Button>
          <Divider />
          {!values.saveMode ? (
            values.did ? (
              <JSONTree
                theme="bright"
                data={pick(values, 'did', 'publicKey', 'privateKey', 'didDocument')}
              />
            ) : (
              <p>Click 👆 to generate key pair, and DID Document</p>
            )
          ) : (
            <div>
              <br />
              {/* Private Key Box */}
              <FormControl className={classes.textField} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Private Key</InputLabel>
                <OutlinedInput
                  readOnly
                  id="outlined-adornment-password"
                  type="text"
                  value={values.privateKey}
                  startAdornment={
                    <InputAdornment position="end">
                      <Tooltip title={values.copyPrivateKey ? 'Copied' : 'Click to copy'}>
                        <IconButton
                          aria-label="toggle copying private key"
                          onClick={handleClickCopyPrivKey}
                          onMouseDown={handleMouseDownPrivKey}
                          edge="start">
                          {values.copyPrivateKey ? <FileCopyIcon /> : <FileCopyOutlineIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                  labelWidth={100}
                />
              </FormControl>
              <p>
                <Typography variant="caption" color="secondary">
                  ⚠️ 👆 Click to copy and save it. It will NOT show it again, after leaving this
                  page
                </Typography>
              </p>
              {/* Formik Submit */}
              <Formik
                initialValues={{ description: '' }}
                validateOnChange={true}
                validationSchema={validation}
                onSubmit={async ({ description }, { setSubmitting }) => {
                  setSubmitting(true);
                  // TODO: Refactoring below lengthy code
                  try {
                    const response = await fetch('/api/dids', {
                      method: 'POST',
                      headers: { 'Content-type': 'application/json' },
                      body: JSON.stringify({
                        description,
                        id: values.did,
                        controllerKey: values.publicKey,
                      }),
                    });
                    if (response.status === 200) {
                      const result = await response.json();
                      result.status = 'OK';
                      setValues({ ...values, result });
                    } else
                      setValues({
                        ...values,
                        result: {
                          status: 'ERROR',
                          error: await response.text(),
                        },
                      });
                  } catch (e) {
                    console.error(e);
                    setValues({
                      ...values,
                      result: {
                        status: 'ERROR',
                        error: util.format('unknown error: %j', e),
                      },
                    });
                  }
                }}>
                {({ values: _values, isSubmitting, errors }) => (
                  <Form>
                    <Field
                      disabled={values?.result}
                      className={classes.textField}
                      label="Description"
                      size="small"
                      component={TextField}
                      name={'description'}
                      placeholder={'Add an easy to remember one-liner'}
                      variant="outlined"
                      margin="normal"
                      fullwidth
                      autoFocus={values.saveMode}
                    />
                    <p>
                      <Button
                        className={classes.submit}
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={
                          isSubmitting ||
                          !!errors?.description ||
                          !_values?.description ||
                          values?.result
                        }
                        type="submit">
                        Submit
                      </Button>
                    </p>
                  </Form>
                )}
              </Formik>
              <Divider />
              {/* Did Document Preview */}
              {values?.result ? (
                <>
                  <p>
                    <Link href="/dashboard/1/identities">
                      <Button variant="outlined" color="secondary">
                        <a>
                          <Typography variant="caption">
                            {values?.result?.status === 'OK'
                              ? 'If private key is saved, you can click me to leave'
                              : 'Something bad happen; try again'}
                          </Typography>
                        </a>
                      </Button>
                    </Link>
                  </p>
                  {values?.result?.status === 'OK' ? (
                    <JSONTree theme="bright" data={pick(values, 'did', 'privateKey')} />
                  ) : (
                    <div />
                  )}
                  <Divider />
                  <Typography variant="caption">Status</Typography>
                  <JSONTree theme="bright" data={values?.result} />
                </>
              ) : (
                <>
                  <Typography variant="h6">Preview DID Document</Typography>
                  <JSONTree theme="bright" data={values.didDocument} />
                </>
              )}
            </div>
          )}
          <Divider variant="inset" />
        </>
      ) : (
        <AccessDenied />
      )}
    </Layout>
  );
};

export const getServerSideProps = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

export default Page;

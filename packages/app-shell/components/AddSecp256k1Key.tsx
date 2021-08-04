import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import type { IDIDManagerAddKeyArgs, IKeyManagerCreateArgs, IKey } from '@verify/server';
import React from 'react';
import type { TenantInfo } from 'types';
import { useFetcher } from 'utils';
import { Form, Field, Formik } from 'formik';
import Result from './Result';
import RawContent from './RawContent';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { margin: theme.spacing(3, 1, 2) },
  })
);

// add Secp256k1 key
const AddSecp256k1Key: React.FC<{ tenantInfo: TenantInfo }> = ({ tenantInfo }) => {
  const classes = useStyles();
  const { slug } = tenantInfo;

  const { val: createSecp256k1Result, poster: createKey } = useFetcher<IKey>();
  const create = async (body: IKeyManagerCreateArgs) =>
    createKey(`/api/tenants/keyManagerCreate?slug=${slug}`, body);
  const { val: addSecp256k1Result, poster: addKey } = useFetcher<any>();
  const add = async (body: IDIDManagerAddKeyArgs) =>
    addKey(`/api/tenants/didManagerAddKey?slug=${slug}`, body);

  return <>Hello</>;
};

export default AddSecp256k1Key;

import MuiTextField from '@material-ui/core/TextField';
import { fieldToTextField, TextFieldProps } from 'formik-material-ui';
import React from 'react';

const lowerCasing: (value: string) => string = (value) =>
  value
    ? value
        .toLowerCase()
        .replace(/-/g, '_')
        .replace(/:/g, '_')
        .replace(/;/g, '')
        .replace(/&/g, '')
        .replace(/#/g, '_')
        .replace(/!/g, '')
        .replace(/\s/g, '_')
        .replace(/\*/g, '')
        .replace(/@/g, '_')
        .replace(/%/g, '')
        .replace(/</g, '_')
        .replace(/>/g, '_')
        .replace(/\?/g, '_')
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/`/g, '')
        .replace(/\[/g, '_')
        .replace(/]/g, '_')
        .replace(/{/g, '')
        .replace(/}/g, '')
        .replace(/\+/g, '')
        .replace(/=/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/,/g, '')
        .replace(/\./g, '.')
        .replace(/\|/g, '')
    : '';

const LowerCasTextField: React.FC<any> = (props: TextFieldProps) => {
  const {
    form: { setFieldValue },
    field: { name },
  } = props;
  const onChange = React.useCallback(
    (event) => {
      const { value } = event.target;
      setFieldValue(name, lowerCasing(value));
    },
    [setFieldValue, name]
  );
  return <MuiTextField {...fieldToTextField(props)} onChange={onChange} />;
};

export default LowerCasTextField;

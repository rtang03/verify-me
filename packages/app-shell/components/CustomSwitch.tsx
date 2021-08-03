import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import { purple } from '@material-ui/core/colors';
import { withStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const MyCustomSwitch = withStyles((theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return {
    switchBase: {
      color: dark ? grey[900] : grey[100],
      '&$checked': {
        color: dark ? grey[100] : grey[900],
      },
      '&$checked + $track': {
        backgroundColor: dark ? grey[900] : grey[100],
      },
    },
    checked: {},
    track: {},
  };
})(Switch);

const CustomSwitch: React.FC<{
  label: string;
  labelPlacement?: string;
  disabled?: boolean;
  name: string;
  state: any;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, disabled, name, state, handleChange, labelPlacement = 'start' }) => {
  // this prevent uncontrolled component
  if (state === undefined) state = false;

  return (
    <>
      <FormGroup>
        <FormControlLabel
          disabled={disabled}
          control={<MyCustomSwitch checked={state} onChange={handleChange} name={`${name}`} />}
          label={label}
          labelPlacement={labelPlacement as 'start'}
        />
      </FormGroup>
    </>
  );
};

export default CustomSwitch;

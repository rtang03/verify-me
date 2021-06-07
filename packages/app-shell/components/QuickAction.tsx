import Button from '@material-ui/core/Button';
import AddBoxIcon from '@material-ui/icons/AddBox';
import Link from 'next/link';
import React from 'react';

const QuickActionComponent: React.FC<{ label: string; link: string; disabled: boolean }> = ({
  label,
  link,
  disabled,
}) => (
  <>
    <Link href={link}>
      <Button
        startIcon={<AddBoxIcon />}
        color="secondary"
        size="large"
        variant="contained"
        disabled={disabled}>
        {label}
      </Button>
    </Link>
    <br />
  </>
);

export default QuickActionComponent;

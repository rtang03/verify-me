import Button from '@material-ui/core/Button';
import Link from 'next/link';
import React from 'react';

const QuickActionComponent: React.FC<{ label: string; link: string; disabled: boolean }> = ({
  label,
  link,
  disabled,
}) => (
  <>
    <Link href={link}>
      <Button color="secondary" size="small" variant="contained" disabled={disabled}>
        {label}
      </Button>
    </Link>
    <br />
  </>
);

export default QuickActionComponent;

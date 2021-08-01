import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import GlossaryTerms, { TERMS } from 'components/GlossaryTerms';
import HelpDialog from 'components/HelpDialog';
import React from 'react';

const HelpButton: React.FC<{ terms: string[] }> = ({ terms }) => {
  // form state - HelpDialog
  const [openHelp, setHelpOpen] = React.useState(false);
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <>
      <Tooltip title="Help">
        <IconButton onClick={handleHelpOpen}>
          <HelpOutlineOutlinedIcon />
        </IconButton>
      </Tooltip>
      <HelpDialog
        open={openHelp}
        handleClose={handleHelpClose}
        content={<GlossaryTerms terms={terms} />}
      />
    </>
  );
};

export default HelpButton;

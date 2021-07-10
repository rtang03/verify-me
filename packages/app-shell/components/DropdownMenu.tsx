import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';

// @see https://material-ui.com/components/menus/#customized-menus

const StyledMenu = withStyles({
  paper: {
    border: '0px solid #d3d4d5',
  },
})((props: MenuProps) => (
  <Menu
    variant="menu"
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem: any = withStyles((theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return {
    root: {
      width: '8ch',
      margin: theme.spacing(0),
      size: 'small',
      '&:hover': {
        '& .MuiListItemIcon-root': {
          color: dark ? grey[100] : grey[900],
        },
      },
    },
  };
})(ListItem);

const DropdownMenu: React.FC<{
  anchorEl: any;
  handleClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
  iconButtons: React.ReactFragment[];
}> = ({ anchorEl, handleClick, handleClose, iconButtons }) => {
  return (
    <div>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        {iconButtons.map((item, index) => (
          <StyledMenuItem button={false} key={index}>
            <ListItemIcon>{item}</ListItemIcon>
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </div>
  );
};

export default DropdownMenu;

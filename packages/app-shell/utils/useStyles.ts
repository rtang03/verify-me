import { makeStyles, Theme } from '@material-ui/core/styles';

const drawerWidth = 240;

export const useStyles = makeStyles((theme: Theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  root: {
    // '& > *': {
    //   marginTop: theme.spacing(2),
    // },
    flexGrow: 1,
    display: 'flex',
  },
  avatar: {
    // used by Layout/Avator
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  paper: {
    // used by Layout/Popup Menu
    marginRight: theme.spacing(2),
  },
  /**
   * @see https://material-ui.com/components/drawers/
   * used by Layout/Drawer
   * **/
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  /* End of Layout/Drawer */
}));

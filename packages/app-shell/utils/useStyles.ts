import { green, grey } from '@material-ui/core/colors';
import { makeStyles, Theme } from '@material-ui/core/styles';

const drawerWidth = 240;

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
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
    zIndex: theme.zIndex.drawer + 10000,
    // width: `calc(100% - ${drawerWidth}px)`,
    // marginLeft: drawerWidth,
  },
  drawer: {
    zIndex: theme.zIndex.drawer,
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
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  /* End of Layout/Drawer */
  // used by Layout's Tenant dropdown listitem
  nested: {
    paddingLeft: theme.spacing(4),
  },
  green: {
    color: '#fff',
    backgroundColor: green[500],
  },
  grey: {
    color: '#fff',
    backgroundColor: grey[500],
  },
  submit: { width: '15ch', margin: theme.spacing(3, 3, 3) },
}));

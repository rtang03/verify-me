import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Collapse from '@material-ui/core/Collapse';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { grey } from '@material-ui/core/colors';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness5Icon from '@material-ui/icons/Brightness5';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import MoreOutlinedIcon from '@material-ui/icons/MoreOutlined';
import NotificationsIcon from '@material-ui/icons/Notifications';
import PermContactCalendarOutlinedIcon from '@material-ui/icons/PermContactCalendarOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import QueueOutlinedIcon from '@material-ui/icons/QueueOutlined';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import clsx from 'clsx';
import Footer from 'components/Footer';
import sortBy from 'lodash/sortBy';
import { signIn, useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import React, { FC, useEffect, MouseEvent, useState, useRef, KeyboardEvent } from 'react';
import type { PaginatedTenant, User as NextAuthUser } from 'types';
import { isClient, useReSWR, useStyles, useLocalStorage, useActiveTenant } from '../utils';
import AvatarMd5 from './AvatarMd5';
import { sideBar } from './sidebar';

interface State {
  openAccount: boolean;
  openTenant: boolean;
  openSwitchTenant: boolean;
}

const Layout: FC<{
  title?: string;
  shouldShow?: any;
  refresh?: any;
  user?: NextAuthUser;
  sideBarIndex?: number;
}> = ({ children, title = 'No Title', shouldShow, refresh, user, sideBarIndex }) => {
  const { toggleStorage, dark, setDark } = useLocalStorage();
  const [session] = useSession();
  const classes = useStyles();
  const [state, setState] = useState<State>({
    openAccount: false,
    openTenant: false,
    openSwitchTenant: false,
  });

  // ALL AVAILABLE TENANTS USED FOR SWITCHING TENANT
  const tenantsUrl = '/api/tenants';
  const { data: allTenants } = useReSWR<PaginatedTenant>(tenantsUrl);

  const handleToggle = (key: keyof State) => () => setState({ ...state, [key]: !state[key] });
  const handleListKeyDown = (key: keyof State) => (event: KeyboardEvent) =>
    event.key === 'Tab' && event.preventDefault() && setState({ ...state, [key]: false });

  // POPUP MENU for TENANT
  // @see https://material-ui.com/components/drawers/
  // @see https://material-ui.com/components/menus/
  const anchorRefTenant = useRef<HTMLButtonElement>(null);

  const handleCloseTenant = ({ target }: MouseEvent<EventTarget>) =>
    !anchorRefTenant?.current?.contains(target as HTMLElement) &&
    setState({ ...state, openTenant: false });
  const prevOpenTenant = useRef(state.openTenant);

  useEffect(() => {
    prevOpenTenant.current && !state.openTenant && anchorRefTenant.current?.focus();
    prevOpenTenant.current = state.openTenant;
  }, [state.openTenant]);
  // END OF TENTANT

  // POPUP MENU for ACCOUNT
  const anchorRefAccount = useRef<HTMLButtonElement>(null);
  const handleCloseAccount = ({ target }: MouseEvent<EventTarget>) =>
    !anchorRefAccount?.current?.contains(target as HTMLElement) &&
    setState({ ...state, openAccount: false });
  const prevOpenAccount = useRef(state.openAccount);

  useEffect(() => {
    prevOpenAccount.current && !state.openAccount && anchorRefAccount.current?.focus();
    prevOpenAccount.current = state.openAccount;
  }, [state.openAccount]);
  // END OF ACCOUNT

  // SET ACTIVE TENANT
  const { activeTenant, updateActiveTenant } = useActiveTenant({
    activeTenantId: user?.active_tenant,
    user,
  });

  useEffect(() => {
    setDark(localStorage.getItem('dark') === 'dark');
  }, [session, toggleStorage]);
  // END OF CHECK ACTIVE TENANT

  // SWITCH TENANT POP-UP BUTTON
  const handleSwitchTenant = () =>
    setState({ ...state, openSwitchTenant: !state.openSwitchTenant });
  // END OF SWITCH TENANT

  // DARK THEME
  const theme = React.useMemo(
    () => createTheme({ palette: { type: dark ? 'dark' : 'light' } }),
    [dark]
  );
  // END of DARK THEME

  // Should Show Payload
  let show = false;
  let setShow: (fcn: any) => void;
  shouldShow && ([show, setShow] = shouldShow);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <div className={classes.root}>
          <Head>
            <title>{title}</title>
          </Head>
          <style jsx global>{`
            a {
              color: inherit;
              text-decoration: none;
            }
          `}</style>
          <CssBaseline />
          <AppBar color={dark ? 'inherit' : 'primary'} position="fixed" className={classes.appBar}>
            <Toolbar>
              <Tooltip title="Home">
                <Button color="inherit">
                  <Link href="/index">
                    <a>
                      <Typography variant="h4">/</Typography>
                    </a>
                  </Link>
                </Button>
              </Tooltip>
              <div className={classes.root} />
              {session ? (
                <>
                  {/*** POP MENU FOR TENANT ***/}
                  <Tooltip title="Active tenant">
                    <Button
                      color="inherit"
                      ref={anchorRefTenant}
                      aria-controls={state.openTenant ? 'menu-list-grow' : undefined}
                      aria-haspopup="true"
                      onClick={handleToggle('openTenant')}>
                      <a>{activeTenant?.slug || 'idle'}</a>
                    </Button>
                  </Tooltip>
                  <Popper
                    open={state.openTenant}
                    anchorEl={anchorRefTenant.current}
                    role={undefined}
                    transition
                    disablePortal>
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}>
                        <Paper>
                          <ClickAwayListener onClickAway={handleCloseTenant}>
                            <MenuList
                              autoFocusItem={state.openTenant}
                              id="menu-list-grow"
                              onKeyDown={handleListKeyDown('openTenant')}>
                              <ListItem onClick={handleCloseTenant}>
                                <ListItemAvatar>
                                  <AvatarMd5 subject={activeTenant?.id || 'idle'} />
                                </ListItemAvatar>
                                <Typography variant="inherit" color="secondary">
                                  {activeTenant?.slug?.toUpperCase() || 'No tenant'}
                                </Typography>
                              </ListItem>
                              <Divider />
                              {/* hide when no active tenant */}
                              {activeTenant?.id && (
                                <Link href={`/dashboard/${activeTenant.id}`}>
                                  <a>
                                    <MenuItem onClick={handleCloseTenant}>
                                      <ListItemIcon>
                                        <SettingsOutlinedIcon />
                                      </ListItemIcon>
                                      <ListItemText secondary="Settings" />
                                    </MenuItem>
                                  </a>
                                </Link>
                              )}
                              {activeTenant?.id && (
                                <Link href={`/dashboard/${activeTenant.id}/invite`}>
                                  <a>
                                    <MenuItem onClick={handleCloseTenant}>
                                      <ListItemIcon>
                                        <PersonAddOutlinedIcon />
                                      </ListItemIcon>
                                      <ListItemText secondary="Invite member" />
                                    </MenuItem>
                                  </a>
                                </Link>
                              )}
                              {!!allTenants?.total && (
                                <ListItem button onClick={handleSwitchTenant}>
                                  <ListItemIcon>
                                    {state.openSwitchTenant ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText secondary="Switch tenant" />
                                </ListItem>
                              )}
                              {allTenants && allTenants?.items?.length !== 0 && user?.id && (
                                <Collapse in={state.openSwitchTenant} timeout="auto" unmountOnExit>
                                  <List component="div" disablePadding>
                                    <Divider />
                                    {sortBy(allTenants.items, 'slug')?.map((item, index) => (
                                      <Link key={index} href={`/dashboard/${item.id}`}>
                                        <ListItem
                                          button
                                          className={classes.nested}
                                          onClick={handleCloseTenant}>
                                          <ListItemIcon
                                            onClick={async () =>
                                              updateActiveTenant(
                                                user.id as string,
                                                item.id as string
                                              )
                                            }>
                                            <AvatarMd5 subject={item.id || 'idle'} size="small" />
                                          </ListItemIcon>
                                          <ListItemText
                                            secondary={item.slug}
                                            onClick={async () =>
                                              user?.id &&
                                              item?.id &&
                                              updateActiveTenant(user.id, item.id)
                                            }
                                          />
                                        </ListItem>
                                      </Link>
                                    ))}
                                    {allTenants?.items?.length > 5 && (
                                      <Link href="/dashboard">
                                        <ListItem button onClick={handleCloseTenant}>
                                          <ListItemIcon>
                                            <MoreOutlinedIcon fontSize="small" />
                                          </ListItemIcon>
                                          <ListItemText secondary="More" />
                                        </ListItem>
                                      </Link>
                                    )}
                                  </List>
                                </Collapse>
                              )}
                              <Divider />
                              <Link href="/dashboard/create">
                                <a>
                                  <MenuItem onClick={handleCloseTenant}>
                                    <ListItemIcon>
                                      <QueueOutlinedIcon />
                                    </ListItemIcon>
                                    <ListItemText secondary="Create tenant" />
                                  </MenuItem>
                                </a>
                              </Link>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                  {/*** END OF POP MENU FOR TENANT ***/}
                  {/*** NOTIFICATIONS ***/}
                  <IconButton>
                    <NotificationsIcon style={{ color: grey[100] }} />
                  </IconButton>
                  {/*** POP MENU FOR ACCOUNT ***/}
                  <Tooltip title="Active account">
                    <Button
                      color="inherit"
                      ref={anchorRefAccount}
                      aria-controls={state.openAccount ? 'menu-list-grow' : undefined}
                      aria-haspopup="true"
                      onClick={handleToggle('openAccount')}>
                      {session?.user?.image ? (
                        <Avatar
                          alt={session?.user?.name || 'Anonymous'}
                          src={session?.user?.image}
                        />
                      ) : (
                        <Typography variant="caption">{session?.user?.name}</Typography>
                      )}
                    </Button>
                  </Tooltip>
                  <Popper
                    open={state.openAccount}
                    anchorEl={anchorRefAccount.current}
                    role={undefined}
                    transition
                    disablePortal>
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}>
                        <Paper>
                          <ClickAwayListener onClickAway={handleCloseAccount}>
                            <MenuList
                              autoFocusItem={state.openAccount}
                              id="menu-list-grow"
                              onKeyDown={handleListKeyDown('openAccount')}>
                              <ListItem onClick={handleCloseAccount}>
                                <ListItemAvatar>
                                  <Avatar src={session?.user?.image || 'idle'} />
                                </ListItemAvatar>
                                <ListItemText primary={session?.user?.name || 'Anonymous'} />
                              </ListItem>
                              <Link href="/profile">
                                <a>
                                  <MenuItem onClick={handleCloseAccount}>
                                    <ListItemIcon>
                                      <PermContactCalendarOutlinedIcon />
                                    </ListItemIcon>
                                    <ListItemText secondary="User profile" />
                                  </MenuItem>
                                </a>
                              </Link>
                              <MenuItem onClick={handleCloseAccount}>
                                <ListItemIcon>
                                  <HelpOutlineOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText secondary="Help" />
                              </MenuItem>
                              <Link href="/api/auth/signout">
                                <a>
                                  <MenuItem onClick={handleCloseAccount}>
                                    <ListItemIcon>
                                      <ExitToAppIcon />
                                    </ListItemIcon>
                                    <ListItemText secondary="Sign out" />
                                  </MenuItem>
                                </a>
                              </Link>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                  {/*** END OF POP MENU FOR ACCOUNT ***/}
                </>
              ) : (
                <Button color="inherit">
                  <a
                    href={`/api/auth/signin`}
                    onClick={(e) => {
                      e.preventDefault();
                      return signIn();
                    }}>
                    Sign In
                  </a>
                </Button>
              )}
              {/*** DARK MODE ***/}
              {dark ? (
                <IconButton
                  onClick={() => {
                    setDark(!dark);
                    isClient() && localStorage.setItem('dark', 'light');
                  }}>
                  <Tooltip title="Toggle dark mode">
                    <Brightness5Icon style={{ color: grey[100] }} />
                  </Tooltip>
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    setDark(!dark);
                    isClient() && localStorage.setItem('dark', 'dark');
                  }}>
                  <Tooltip title="Toggle dark mode">
                    <Brightness4Icon style={{ color: grey[100] }} />
                  </Tooltip>
                </IconButton>
              )}
              {shouldShow && show && (
                <Tooltip title="Toggle raw content">
                  <IconButton onClick={() => setShow((value: boolean) => !value)}>
                    <VisibilityOutlinedIcon style={{ color: grey[100] }} />
                  </IconButton>
                </Tooltip>
              )}
              {shouldShow && !show && (
                <Tooltip title="Toggle raw content">
                  <IconButton onClick={() => setShow((value: boolean) => !value)}>
                    <VisibilityOffOutlinedIcon style={{ color: grey[100] }} />
                  </IconButton>
                </Tooltip>
              )}
            </Toolbar>
          </AppBar>
          <Drawer
            open={!!session?.user}
            className={classes.drawer}
            variant="persistent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left">
            <Divider />
            <div className={classes.toolbar} />
            <Divider />
            <List>
              {sideBar(activeTenant?.id || '0').map(({ text, icon, link }, index) => (
                <Link href={link} key={index}>
                  <ListItem button selected={sideBarIndex === index}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText secondary={text} />
                  </ListItem>
                </Link>
              ))}
              <Divider />
            </List>
          </Drawer>
          <main className={clsx(classes.content, { [classes.contentShift]: !!session?.user })}>
            <div className={classes.toolbar} />
            {children}
          </main>
        </div>
        {!session?.user && (
          <div className={classes.footer}>
            <Footer />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Layout;

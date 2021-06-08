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
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness5Icon from '@material-ui/icons/Brightness5';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UserProfileIcon from '@material-ui/icons/PermContactCalendar';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import QueueIcon from '@material-ui/icons/Queue';
import SettingsIcon from '@material-ui/icons/Settings';
import clsx from 'clsx';
import sortBy from 'lodash/sortBy';
import { signIn, signOut, useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import React, { FC, useEffect, MouseEvent, useState, useRef, KeyboardEvent } from 'react';
import type { PaginatedTenant } from '../types';
import { useReSWR, useStyles } from '../utils';
import AvatarMd5 from './AvatarMd5';
import { sideBar } from './sidebar';

interface State {
  openAccount: boolean;
  openTenant: boolean;
  openSwitchTenant: boolean;
}
const isClient = () => typeof window !== 'undefined';

const Layout: FC<{ title?: string }> = ({ children, title = 'No Title' }) => {
  const [session] = useSession();
  const classes = useStyles();
  const [state, setState] = useState<State>({
    openAccount: false,
    openTenant: false,
    openSwitchTenant: false,
  });
  const { data: tenant, isLoading } = useReSWR<PaginatedTenant>('/api/tenants');
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

  // ACTIVE TENANT
  const [toggleStorage, setToggleStorage] = useState(false);
  const [slugLocal, setSlugLocal] = useState<string | null>('');
  const [tenantIdLocal, setTenantIdLocal] = useState<string | null>('');
  useEffect(() => {
    setSlugLocal(localStorage.getItem('slug'));
    setTenantIdLocal(localStorage.getItem('tenantId'));
    setDark(localStorage.getItem('dark') === 'dark');

    if (tenant && !isLoading) {
      const tenantId = tenant.items?.[0]?.id;
      const slug = tenant.items?.[0]?.slug;
      isClient() &&
        tenantId &&
        !localStorage.getItem('tenantId') &&
        localStorage.setItem('tenantId', tenantId);
      isClient() && slug && !localStorage.getItem('slug') && localStorage.setItem('slug', slug);
    }
  }, [session, toggleStorage]);

  const setActiveTenant = (id: string, slug: string) => {
    if (isClient()) {
      setToggleStorage(!toggleStorage);
      localStorage.setItem('tenantId', id);
      localStorage.setItem('slug', slug);
    }
  };
  // END OF CHECK ACTIVE TENANT

  // SWITCH TENANT
  const handleSwitchTenant = () =>
    setState({ ...state, openSwitchTenant: !state.openSwitchTenant });
  // END OF SWITCH TENANT

  // DARK THEME
  const [dark, setDark] = useState(false);
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: { type: dark ? 'dark' : 'light' },
      }),
    [dark]
  );
  // END of DARK THEME

  return (
    <ThemeProvider theme={theme}>
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
            <Button color="inherit">
              <Link href="/">
                <a>
                  <Typography variant="body2" noWrap>
                    Home
                  </Typography>
                </a>
              </Link>
            </Button>
            <div className={classes.root} />
            {dark ? (
              <IconButton
                onClick={() => {
                  setDark(!dark);
                  isClient() && localStorage.setItem('dark', 'light');
                }}>
                <Brightness5Icon />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  setDark(!dark);
                  isClient() && localStorage.setItem('dark', 'dark');
                }}>
                <Brightness4Icon />
              </IconButton>
            )}
            {session ? (
              <>
                {/*** POP MENU FOR TENANT ***/}
                <Button
                  color="inherit"
                  ref={anchorRefTenant}
                  aria-controls={state.openTenant ? 'menu-list-grow' : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle('openTenant')}>
                  <a>{slugLocal || 'No tenant'}</a>
                </Button>
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
                                <AvatarMd5 subject={tenantIdLocal || 'idle'} />
                              </ListItemAvatar>
                              <Typography variant="inherit" color="secondary">
                                {slugLocal || 'No tenant'}
                              </Typography>
                            </ListItem>
                            <Divider />
                            {/* hide when no active tenant */}
                            {tenantIdLocal && (
                              <Link href={`/dashboard/${tenantIdLocal}`}>
                                <a>
                                  <ListItem onClick={handleCloseTenant}>
                                    <ListItemIcon>
                                      <SettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText secondary="Settings" />
                                  </ListItem>
                                </a>
                              </Link>
                            )}
                            {tenantIdLocal && (
                              <ListItem onClick={handleCloseTenant}>
                                <ListItemIcon>
                                  <PersonAddIcon />
                                </ListItemIcon>
                                <ListItemText secondary="Invite member" />
                              </ListItem>
                            )}
                            {tenantIdLocal && (
                              <ListItem button onClick={handleSwitchTenant}>
                                <ListItemIcon>
                                  {state.openSwitchTenant ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemIcon>
                                <ListItemText secondary="Switch tenant" />
                              </ListItem>
                            )}
                            {tenant && tenant?.items?.length !== 0 && (
                              <Collapse in={state.openSwitchTenant} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                  {sortBy(tenant.items, 'slug')?.map((item, index) => (
                                    <Link key={index} href={`/dashboard/${item.id}`}>
                                      <ListItem
                                        button
                                        className={classes.nested}
                                        onClick={handleCloseTenant}>
                                        <ListItemIcon>
                                          <AvatarMd5 subject={item.id || 'idle'} size="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                          secondary={item.slug}
                                          onClick={() =>
                                            setActiveTenant(item.id || '', item.slug || '')
                                          }
                                        />
                                      </ListItem>
                                    </Link>
                                  ))}
                                </List>
                              </Collapse>
                            )}

                            <Divider />
                            <Link href="/dashboard/create">
                              <a>
                                <ListItem onClick={handleCloseTenant}>
                                  <ListItemIcon>
                                    <QueueIcon />
                                  </ListItemIcon>
                                  <ListItemText secondary="Create tenant" />
                                </ListItem>
                              </a>
                            </Link>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
                {/*** END OF POP MENU FOR TENANT ***/}
                {/*** POP MENU FOR ACCOUNT ***/}
                <span
                  style={{ backgroundImage: `url(${session?.user?.image})` }}
                  className={classes.avatar}
                />
                <Button
                  color="inherit"
                  ref={anchorRefAccount}
                  aria-controls={state.openAccount ? 'menu-list-grow' : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle('openAccount')}>
                  {session?.user?.image ? (
                    <Avatar alt={session?.user?.name || 'Anonymous'} src={session?.user?.image} />
                  ) : (
                    <Typography variant="caption">{session?.user?.name}</Typography>
                  )}
                </Button>
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
                                <ListItem onClick={handleCloseAccount}>
                                  <ListItemIcon>
                                    <UserProfileIcon />
                                  </ListItemIcon>
                                  <ListItemText secondary="User profile" />
                                </ListItem>
                              </a>
                            </Link>
                            <ListItem onClick={handleCloseAccount}>
                              <ListItemIcon>
                                <ExitToAppIcon />
                              </ListItemIcon>
                              <a
                                href={`/api/auth/signout`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  return signOut();
                                }}>
                                <ListItemText secondary="Sign out" />
                              </a>
                            </ListItem>
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
            {sideBar(tenantIdLocal || '0').map(({ text, icon, link }, index) => (
              <Link href={link} key={index}>
                <ListItem button>
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
    </ThemeProvider>
  );
};

export default Layout;

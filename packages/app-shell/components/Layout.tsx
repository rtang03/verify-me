import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Collapse from '@material-ui/core/Collapse';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Grow from '@material-ui/core/Grow';
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
import Typography from '@material-ui/core/Typography';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UserProfileIcon from '@material-ui/icons/PermContactCalendar';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import QueueIcon from '@material-ui/icons/Queue';
import SettingsIcon from '@material-ui/icons/Settings';
import sortBy from 'lodash/sortBy';
import { signIn, signOut, useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import React, { FC, useEffect, MouseEvent, useState, useRef, KeyboardEvent } from 'react';
import type { PaginatedTenant } from '../types';
import { useCommonResponse, useStyles } from '../utils';
import AvatarMd5 from './AvatarMd5';
import { sideBar } from './sidebar';

interface State {
  openAccount: boolean;
  openTenant: boolean;
}

const Layout: FC<{ title?: string }> = ({ children, title = 'No Title' }) => {
  const [session] = useSession();
  const classes = useStyles();
  const { data: tenant, isError, isLoading } = useCommonResponse<PaginatedTenant>('/api/tenants');
  const [val, setVal] = useState<State>({ openAccount: false, openTenant: false });
  const handleToggle = (state: keyof State) => () => setVal({ ...val, [state]: !val[state] });
  const handleListKeyDown = (state: keyof State) => (event: KeyboardEvent) =>
    event.key === 'Tab' && event.preventDefault() && setVal({ ...val, [state]: false });

  // POPUP MENU for TENANT
  // @see https://material-ui.com/components/drawers/
  // @see https://material-ui.com/components/menus/
  const anchorRefTenant = useRef<HTMLButtonElement>(null);

  const handleCloseTenant = ({ target }: MouseEvent<EventTarget>) =>
    !anchorRefTenant?.current?.contains(target as HTMLElement) &&
    setVal({ ...val, openTenant: false });

  const prevOpenTenant = useRef(val.openTenant);

  useEffect(() => {
    prevOpenTenant.current && !val.openTenant && anchorRefTenant.current?.focus();
    prevOpenTenant.current = val.openTenant;
  }, [val.openTenant]);
  // END OF TENTANT

  // POPUP MENU for ACCOUNT
  const anchorRefAccount = useRef<HTMLButtonElement>(null);
  const handleCloseAccount = ({ target }: MouseEvent<EventTarget>) =>
    !anchorRefAccount?.current?.contains(target as HTMLElement) &&
    setVal({ ...val, openAccount: false });
  const prevOpenAccount = useRef(val.openAccount);

  useEffect(() => {
    prevOpenAccount.current && !val.openAccount && anchorRefAccount.current?.focus();
    prevOpenAccount.current = val.openAccount;
  }, [val.openAccount]);
  // END OF ACCOUNT

  // ACTIVE TENANT
  const getTenantId = () =>
    (typeof window !== 'undefined' && localStorage.getItem('tenantId')) || null;
  const getSlug = () => (typeof window !== 'undefined' && localStorage.getItem('slug')) || null;
  if (tenant && !isLoading) {
    const tenantId = tenant.items?.[0]?.id;
    const slug = tenant.items?.[0]?.slug;
    // check if the localStorage's tenantId & slug is not out-of-dated.
    const tenants = tenant?.items?.map(({ id }) => ({ id }));
    if (tenants?.filter(({ id }) => id === getTenantId()).length === 0) {
      typeof window !== 'undefined' && localStorage.setItem('tenantId', '');
      typeof window !== 'undefined' && localStorage.setItem('slug', '');
    }
    // if none exists, save it to localStorage
    !getTenantId() &&
      typeof window !== 'undefined' &&
      tenantId &&
      localStorage.setItem('tenantId', tenantId);
    !getSlug() && typeof window !== 'undefined' && slug && localStorage.setItem('slug', slug);
  }
  const setActiveTenant = (id: string, slug: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenantId', id);
      localStorage.setItem('slug', slug);
    }
  };
  // END OF CHECK ACTIVE TENANT

  // SWITCH TENANT
  const [openSwitchTenant, setOpenSwitchTenant] = useState(false);
  const handleSwitchTenant = () => setOpenSwitchTenant(!openSwitchTenant);
  // END OF SWITCH TENANT

  return (
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
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Button color="inherit">
            <Link href="/">
              <Typography variant="caption" noWrap>
                Home
              </Typography>
            </Link>
          </Button>

          <div className={classes.root} />
          {session ? (
            <>
              {/*** POP MENU FOR TENANT ***/}
              <Button
                color="inherit"
                ref={anchorRefTenant}
                aria-controls={val.openTenant ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle('openTenant')}>
                <a>{getSlug() || 'No tenant'}</a>
              </Button>
              <Popper
                open={val.openTenant}
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
                          autoFocusItem={val.openTenant}
                          id="menu-list-grow"
                          onKeyDown={handleListKeyDown('openTenant')}>
                          <ListItem onClick={handleCloseTenant}>
                            <ListItemAvatar>
                              <AvatarMd5 subject={getTenantId() || 'idle'} />
                            </ListItemAvatar>
                            <Typography variant="inherit" color="secondary">
                              {typeof window !== 'undefined' && (getSlug() || 'No tenant')}
                            </Typography>
                          </ListItem>
                          <Divider />
                          {/* hide when no active tenant */}
                          {getTenantId() && (
                            <Link href={`/dashboard/${getTenantId()}`}>
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
                          {getTenantId() && (
                            <ListItem onClick={handleCloseTenant}>
                              <ListItemIcon>
                                <PersonAddIcon />
                              </ListItemIcon>
                              <ListItemText secondary="Invite member" />
                            </ListItem>
                          )}
                          {getTenantId() && (
                            <ListItem button onClick={handleSwitchTenant}>
                              <ListItemIcon>
                                {openSwitchTenant ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </ListItemIcon>
                              <ListItemText secondary="Switch tenant" />
                            </ListItem>
                          )}
                          {tenant && tenant?.items?.length !== 0 && (
                            <Collapse in={openSwitchTenant} timeout="auto" unmountOnExit>
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
                aria-controls={val.openAccount ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle('openAccount')}>
                {session?.user?.image ? (
                  <Avatar alt={session?.user?.name || 'Anonymous'} src={session?.user?.image} />
                ) : (
                  <Typography variant="caption">{session?.user?.name}</Typography>
                )}
              </Button>
              <Popper
                open={val.openAccount}
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
                          autoFocusItem={val.openAccount}
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
        open={false}
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left">
        <Divider />
        <div className={classes.toolbar} />
        <Divider />
        <List>
          {sideBar(getTenantId() || '0').map(({ text, icon, link }, index) => (
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
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
};

export default Layout;

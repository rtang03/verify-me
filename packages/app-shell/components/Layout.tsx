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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import type { Paginated, Tenant } from '@verify/server';
import sortBy from 'lodash/sortBy';
import { signIn, signOut, useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import React, { FC, useEffect, MouseEvent, useState, useRef, KeyboardEvent } from 'react';
import { useFetcher, useStyles } from '../utils';
import { sideBar } from './sidebar';

interface State {
  openAccount: boolean;
  openTenant: boolean;
}

const Layout: FC<{ title?: string }> = ({ children, title = 'No Title' }) => {
  const { val: tenant, fetcher: tenantFetcher } = useFetcher<Paginated<Tenant>>();
  const [session, loading] = useSession();
  const classes = useStyles();
  const [val, setVal] = useState<State>({ openAccount: false, openTenant: false });
  const handleToggle = (state: keyof State) => () => setVal({ ...val, [state]: !val[state] });
  const handleListKeyDown = (state: keyof State) => (event: KeyboardEvent) =>
    event.key === 'Tab' && event.preventDefault() && setVal({ ...val, [state]: false });

  // @see https://material-ui.com/components/drawers/
  // @see https://material-ui.com/components/menus/
  // POPUP MENU for TENANT
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
  useEffect(() => {
    tenantFetcher(`/api/tenants`).finally(() => true);
  }, [session]);
  const getTenantId = () => typeof window !== 'undefined' && localStorage.getItem('tenantId');
  const getSlug = () => typeof window !== 'undefined' && localStorage.getItem('slug');
  if (tenant?.data && !tenant.loading) {
    const tenantId = tenant.data.items?.[0]?.id;
    const slug = tenant.data.items?.[0]?.slug;
    !getTenantId() && typeof window !== 'undefined' && localStorage.setItem('tenantId', tenantId);
    !getSlug() && typeof window !== 'undefined' && localStorage.setItem('slug', slug);
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
                          <MenuItem onClick={handleCloseTenant}>
                            <Typography variant="inherit" color="secondary">
                              {getSlug() || 'No tenant'}
                            </Typography>
                          </MenuItem>
                          {/* hide when no active tenant */}
                          {getTenantId() && (
                            <Link href={`/dashboard/${getTenantId()}`}>
                              <a>
                                <MenuItem onClick={handleCloseTenant}>
                                  <ListItemText secondary="Settings" />
                                </MenuItem>
                              </a>
                            </Link>
                          )}
                          {getTenantId() && (
                            <MenuItem onClick={handleCloseTenant}>
                              <span>Invite member</span>
                            </MenuItem>
                          )}
                          {getTenantId() && (
                            <ListItem button onClick={handleSwitchTenant}>
                              <ListItemText primary="Switch tenant" />
                              {openSwitchTenant ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                          )}
                          <Collapse in={openSwitchTenant} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {sortBy(tenant?.data?.items, 'slug').map((item, index) => (
                                <Link key={index} href={`/dashboard/${item.id}`}>
                                  <ListItem
                                    button
                                    className={classes.nested}
                                    onClick={handleCloseTenant}>
                                    <ListItemText
                                      secondary={item.slug}
                                      onClick={() => setActiveTenant(item.id, item.slug)}
                                    />
                                  </ListItem>
                                </Link>
                              ))}
                            </List>
                          </Collapse>
                          <Divider />
                          <Link href="/dashboard/create">
                            <a>
                              <MenuItem onClick={handleCloseTenant}>Create tenant</MenuItem>
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
                          <MenuItem onClick={handleCloseAccount}>
                            <span>
                              {session?.user?.name || 'Anonymous'}
                              <br />
                              <Typography variant="caption">{session?.user?.email}</Typography>
                            </span>
                          </MenuItem>
                          <MenuItem onClick={handleCloseAccount}>
                            <Link href="/profile">Account Settings</Link>
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={handleCloseAccount}>
                            <a
                              href={`/api/auth/signout`}
                              onClick={(e) => {
                                e.preventDefault();
                                return signOut();
                              }}>
                              Sign Out
                            </a>
                          </MenuItem>
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
          {sideBar.map(({ text, icon, link }, index) => (
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

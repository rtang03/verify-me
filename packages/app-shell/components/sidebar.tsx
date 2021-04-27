import AccountBoxIcon from '@material-ui/icons/AccountBox';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import PhonelinkIcon from '@material-ui/icons/Phonelink';

export const sideBar: { text: string; icon: any, link: string }[] = [
  {
    text: 'Application',
    icon: <PhonelinkIcon />,
    link: '/dashboard/1/apps'
  },
  {
    text: 'Identity',
    icon: <AccountBoxIcon />,
    link: '/dashboard/1/identities'
  },
  {
    text: 'Credentials',
    icon: <FolderSharedIcon />,
    link: '/dashboard/1/credentials'
  },
];

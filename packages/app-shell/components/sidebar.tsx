import AccountBoxIcon from '@material-ui/icons/AccountBox';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import PhonelinkIcon from '@material-ui/icons/Phonelink';

export const sideBar: { text: string; icon: any; link: string }[] = [
  {
    text: 'Identitifers',
    icon: <AccountBoxIcon />,
    link: '/dashboard/1/identities',
  },
  {
    text: 'Users',
    icon: <FolderSharedIcon />,
    link: '/dashboard/1/users',
  },
  {
    text: 'Credentials',
    icon: <PhonelinkIcon />,
    link: '/dashboard/1/credentials',
  },
];

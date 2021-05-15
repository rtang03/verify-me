import AccountBoxIcon from '@material-ui/icons/AccountBox';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import MailIcon from '@material-ui/icons/Mail';
import PhonelinkIcon from '@material-ui/icons/Phonelink';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';

export const sideBar: { text: string; icon: any; link: string }[] = [
  {
    text: 'Issuer',
    icon: <AccountBoxIcon />,
    link: '/dashboard/1/identities',
  },
  {
    text: 'User',
    icon: <FolderSharedIcon />,
    link: '/dashboard/1/users',
  },
  {
    text: 'Credential',
    icon: <PhonelinkIcon />,
    link: '/dashboard/1/credentials',
  },
  {
    text: 'Inbox',
    icon: <MailIcon />,
    link: '/dashboard/1/messages',
  },
  {
    text: 'Request',
    icon: <ScreenShareIcon />,
    link: '/dashboard/1/requests',
  },  {
    text: 'Response',
    icon: <CallReceivedIcon />,
    link: '/dashboard/1/responses',
  },
];

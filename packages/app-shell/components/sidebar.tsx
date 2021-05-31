import CallReceivedIcon from '@material-ui/icons/CallReceived';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import LanguageIcon from '@material-ui/icons/Language';
import MailIcon from '@material-ui/icons/Mail';
import PhonelinkIcon from '@material-ui/icons/Phonelink';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';

export const sideBar: (tenantId: string) => { text: string; icon: any; link: string }[] = (id) => [
  {
    text: 'Web Identifier',
    icon: <LanguageIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/identities`,
  },
  {
    text: 'User Identifier',
    icon: <FolderSharedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/users`,
  },
  {
    text: 'Credential',
    icon: <PhonelinkIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/credentials`,
  },
  {
    text: 'Inbox',
    icon: <MailIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/messages`,
  },
  {
    text: 'Request',
    icon: <ScreenShareIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/requests`,
  },
  {
    text: 'Response',
    icon: <CallReceivedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/responses`,
  },
];

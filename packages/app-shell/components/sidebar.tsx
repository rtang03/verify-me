import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import LanguageIcon from '@material-ui/icons/Language';
import MailIcon from '@material-ui/icons/Mail';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';

export const sideBar: (tenantId: string) => { text: string; icon: any; link: string }[] = (id) => [
  {
    text: 'Did Document',
    icon: <LanguageIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/identifiers`,
  },
  {
    text: 'User Identifier',
    icon: <FolderSharedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/users`,
  },
  {
    text: 'Credential',
    icon: <BallotOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/credentials`,
  },
  {
    text: 'Request',
    icon: <ScreenShareIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/requests`,
  },
  {
    text: 'Inbox',
    icon: <MailIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/messages`,
  },
];

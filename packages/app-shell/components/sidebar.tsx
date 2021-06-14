import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import FolderSharedOutlinedIcon from '@material-ui/icons/FolderSharedOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import MailOutlineOutlinedIcon from '@material-ui/icons/MailOutlineOutlined';
import ScreenShareOutlinedIcon from '@material-ui/icons/ScreenShareOutlined';

export const sideBar: (tenantId: string) => { text: string; icon: any; link: string }[] = (id) => [
  {
    text: 'Did Document',
    icon: <LanguageIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/identifiers`,
  },
  {
    text: 'User Identifier',
    icon: <FolderSharedOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/users`,
  },
  {
    text: 'Credential',
    icon: <BallotOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/credentials`,
  },
  {
    text: 'Request',
    icon: <ScreenShareOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/requests`,
  },
  {
    text: 'Inbox',
    icon: <MailOutlineOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/messages`,
  },
];

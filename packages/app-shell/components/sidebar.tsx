import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import FolderSharedOutlinedIcon from '@material-ui/icons/FolderSharedOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import MailOutlineOutlinedIcon from '@material-ui/icons/MailOutlineOutlined';
import ScreenShareOutlinedIcon from '@material-ui/icons/ScreenShareOutlined';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';

export const sideBar: (tenantId: string) => { text: string; icon: any; link: string }[] = (id) => [
  {
    text: 'Did Document',
    icon: <LanguageIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/identifiers`,
  },
  {
    text: 'User',
    icon: <FolderSharedOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/users`,
  },
  {
    text: 'Credential',
    icon: <BallotOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/credentials`,
  },
  // {
  //   text: 'Request',
  //   icon: <SendOutlinedIcon />,
  //   link: id === '0' ? `/dashboard` : `/dashboard/${id}/requests`,
  // },
  {
    text: 'Presentation',
    icon: <ScreenShareOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/presentations`,
  },
  {
    text: 'Inbox',
    icon: <MailOutlineOutlinedIcon />,
    link: id === '0' ? `/dashboard` : `/dashboard/${id}/messages`,
  },
];

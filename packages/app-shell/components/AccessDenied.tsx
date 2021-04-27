import Typography from '@material-ui/core/Typography';
import { signIn } from 'next-auth/client';

const AccessDenied = () => (
  <>
    <Typography variant="h6">Access Denied</Typography>
    <p>
      <a
        href="/api/auth/signin"
        onClick={(e) => {
          e.preventDefault();
          return signIn();
        }}>
        You must be signed in to view this page
      </a>
    </p>
  </>
);

export default AccessDenied;

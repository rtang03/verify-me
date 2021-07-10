import Button from '@material-ui/core/Button';
import type { NextPage } from 'next';

const IndexPage: NextPage<any> = () => {
  return (
    <>
      <div>Let me in</div>
      <Button variant="contained" color="primary">
        VC-AuthN Request with OIDC Client
      </Button>
    </>
  );
};

export default IndexPage;

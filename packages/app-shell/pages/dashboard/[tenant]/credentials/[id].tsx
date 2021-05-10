import { requireAuth } from 'components';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  return <div />;
};

export const getServerSideProps = requireAuth;

export default Page;

import { requireAuth } from 'components';
import Layout from 'components/Layout';
import type { NextPage } from 'next';
import { Session } from 'next-auth';

const Page: NextPage<{ session: Session }> = ({ session }) => {
  return <Layout title="Messages">Messages</Layout>;
};

export const getServerSideProps = requireAuth;

export default Page;

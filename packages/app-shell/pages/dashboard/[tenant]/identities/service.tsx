import Layout from 'components/Layout';
import Main from 'components/Main';
import type { NextPage } from 'next';
import type { Session } from 'next-auth';

const IdentifiersServicePage: NextPage<{ session: Session }> = ({ session }) => {
  return <Layout title="Identifier">Hello</Layout>;
};

export default IdentifiersServicePage;

import { NextPageContext } from 'next';
import { getSession } from 'next-auth/client';

export const withAuth = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

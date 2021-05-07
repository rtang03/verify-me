import { NextPageContext } from 'next';
import { getSession } from 'next-auth/client';

export const requireAuth = async (context: NextPageContext) => ({
  props: { session: await getSession(context) },
});

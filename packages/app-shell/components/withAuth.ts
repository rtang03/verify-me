import type { NextPageContext } from 'next';
import { getSession } from 'next-auth/client';
import { useRouter } from 'next/router';

export const withAuth = async (context: NextPageContext) => {
  if (context?.query?.tenant) {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/tenants/actions?id=${context.query.tenant}&action=is_activated&slug=dummybank`
    );
    const json = await response.json();
    console.log(json);
  }
  return {
    props: { session: await getSession(context) },
  };
};

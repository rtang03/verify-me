import type { NextPageContext } from 'next';
import { useRouter } from 'next/router';

export const withActivation = async (context: NextPageContext) => {
  const router = useRouter();
  const response = await fetch(
    `/api/tenants&id=${router.query.tenant}&actions=is_activated&slug=dummybank`
  );
  const json = response.json();
  console.log(json);

  return {
    ...context,
  };
};

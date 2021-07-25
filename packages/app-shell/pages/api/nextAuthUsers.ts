import { createRestHandler } from '../../utils';

// this is User Entity of Next-Auth
const handler = createRestHandler(`${process.env.NEXT_PUBLIC_BACKEND}/users`);

export default handler;

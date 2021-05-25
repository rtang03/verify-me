import { createHandlerByDomain } from '../../../utils';

const handler = createHandlerByDomain(`${process.env.NEXT_PUBLIC_DOMAIN}/actions`, ['GET']);

export default handler;

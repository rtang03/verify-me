import { createHandlerByActions } from '../../../utils';

const handler = createHandlerByActions(`${process.env.NEXT_PUBLIC_DOMAIN}`, ['GET', 'POST']);

export default handler;

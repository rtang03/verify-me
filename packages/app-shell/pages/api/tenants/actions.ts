import { createRestHandler } from '../../../utils';

const handler = createRestHandler(`${process.env.NEXT_PUBLIC_BACKEND}/actions`, ['POST']);

export default handler;

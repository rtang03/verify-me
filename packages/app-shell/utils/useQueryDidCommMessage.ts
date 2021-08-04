import type { IMessage } from '@verify/server';
import { useRouter } from 'next/router';
import { useReSWR } from './useReSWR';

export const useQueryDidCommMessage: (slug: string | undefined) => {
  message: IMessage | undefined | null;
  messageId: string;
  isMessageError: boolean;
  isMessageLoading: boolean;
} = (slug) => {
  const router = useRouter();

  // Query Message
  const id = router.query.id as string; // hash
  const url = slug ? `/api/messages/${id}?slug=${slug}&id=${id}` : null;
  const {
    data: message,
    isLoading: isMessageLoading,
    isError: isMessageError,
  } = useReSWR<IMessage>(url, !!slug);

  return { message, messageId: id, isMessageError, isMessageLoading };
};

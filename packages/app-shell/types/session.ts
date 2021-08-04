import type { Session as NextAuthSession } from 'next-auth';
import { User as NextAuthUser } from './User';

export type User = NextAuthUser & { id?: string };

export type Session = NextAuthSession & { user: User };

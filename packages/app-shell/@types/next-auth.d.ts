import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { User as NextAuthUser } from '../types';

/** Example on how to extend the built-in session types */
declare module 'next-auth' {
  interface Session {
    /** This is an example. You can find me in types/next-auth.d.ts */
    // user: Partial<
    //   Pick<User, 'name' | 'email' | 'email_verified' | 'active_tenant' | 'image'>
    // >;
    user: NextAuthUser;
  }
}

/** Example on how to extend the built-in types for JWT */
declare module 'next-auth/jwt' {
  interface JWT {
    /** This is an example. You can find me in types/next-auth.d.ts */
    bar: number;
  }
}

/**
 * NextAuth Module Augmentation
 * Extends NextAuth types with custom properties
 */

import type { DefaultUser, DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'customer' | 'vendor' | 'staff' | 'admin';
      vendorId?: string;
      verified: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: 'customer' | 'vendor' | 'staff' | 'admin';
    vendorId?: string;
    verified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role: 'customer' | 'vendor' | 'staff' | 'admin';
    vendorId?: string;
    verified: boolean;
  }
}

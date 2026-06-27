/**
 * NextAuth Configuration and Route Handler
 * Implements Credentials provider with OTP verification
 * Supports email or phone + OTP authentication
 */

import type {} from '@/types/next-auth';
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { verifyOtp } from '@/lib/auth/otp';
import type { Staff } from '@/lib/firebase/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CustomUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  role: 'customer' | 'vendor' | 'staff' | 'admin';
  vendorId?: string;
  verified: boolean;
}

// ============================================================================
// Credentials Validation Schema
// ============================================================================

const CredentialsSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  otp: z.string().min(6).max(6),
  role: z.enum(['customer', 'vendor', 'staff']),
});

type CredentialsInput = z.infer<typeof CredentialsSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Lazy load Firebase Admin imports (to avoid initialization at build time)
 */
async function getFirebaseServices() {
  const { adminDb, adminAuthInstance, setCustomUserClaims } = await import('@/lib/firebase/admin');
  return { adminDb, adminAuthInstance, setCustomUserClaims };
}

/**
 * Find or create a user in Firestore based on email or phone
 */
async function findOrCreateUser(
  identifier: string,
  role: string,
  isEmail: boolean
): Promise<CustomUser> {
  const { adminDb, adminAuthInstance } = await getFirebaseServices();
  const usersRef = adminDb.collection('users');

  // Try to find existing user by email or phone
  let userQuery;
  if (isEmail) {
    userQuery = await usersRef.where('email', '==', identifier).limit(1).get();
  } else {
    userQuery = await usersRef.where('phone', '==', identifier).limit(1).get();
  }

  // User exists
  if (!userQuery.empty) {
    const doc = userQuery.docs[0];
    const userData = doc.data();
    return {
      id: doc.id,
      email: userData.email || null,
      phone: userData.phone || null,
      name: userData.name || null,
      role: userData.role,
      vendorId: userData.vendorId,
      verified: userData.verified === true,
    };
  }

  // Create new user in Firebase Auth
  let uid: string;
  try {
    const userRecord = await adminAuthInstance.createUser(
      isEmail
        ? { email: identifier, emailVerified: true }
        : { phoneNumber: identifier }
    );
    uid = userRecord.uid;
  } catch (error: any) {
    // User might already exist in Auth but not in Firestore
    if (error.code === 'auth/email-already-exists' || error.code === 'auth/phone-number-already-exists') {
      // Try to get the user
      try {
        const userRecord = isEmail
          ? await adminAuthInstance.getUserByEmail(identifier)
          : await adminAuthInstance.getUserByPhoneNumber(identifier);
        uid = userRecord.uid;
      } catch {
        throw new Error('Failed to create or retrieve user');
      }
    } else {
      throw error;
    }
  }

  // Create user document in Firestore
  const now = Date.now();
  const newUser: any = {
    uid,
    role,
    verified: true,
    createdAt: now,
    updatedAt: now,
  };

  // Add consent flags (required for customers, but good practice for all)
  if (role === 'customer') {
    newUser.consent = {
      vendorMarketingSms: { value: false, ts: now, source: 'signup' },
      vendorMarketingEmail: { value: false, ts: now, source: 'signup' },
      platformDealsSms: { value: false, ts: now, source: 'signup' },
      platformDealsEmail: { value: false, ts: now, source: 'signup' },
    };
  }

  if (isEmail) {
    newUser.email = identifier;
  } else {
    newUser.phone = identifier;
  }

  await adminDb.collection('users').doc(uid).set(newUser);

  return {
    id: uid,
    email: isEmail ? identifier : null,
    phone: isEmail ? null : identifier,
    name: null,
    role: role as 'customer' | 'vendor' | 'staff',
    vendorId: undefined,
    verified: true,
  };
}

/**
 * Set custom claims on the user's Firebase Auth token
 */
async function setUserClaims(uid: string, role: string, vendorId?: string): Promise<void> {
  const { setCustomUserClaims } = await getFirebaseServices();

  const customClaims: Record<string, unknown> = {
    role,
    verified: true,
  };

  if (vendorId) {
    customClaims.vendorId = vendorId;
  }

  await setCustomUserClaims(uid, customClaims);
}

/**
 * Get vendor ID for vendor/staff users
 */
async function getVendorId(uid: string, role: string): Promise<string | undefined> {
  if (role === 'vendor') {
    // For vendors, the vendorId is their UID
    return uid;
  }

  if (role === 'staff') {
    // For staff, find their vendor from the staff collection
    const { adminDb } = await getFirebaseServices();
    const staffDoc = await adminDb.collection('staff').doc(uid).get();
    if (staffDoc.exists) {
      const staffData = staffDoc.data() as Partial<Staff>;
      return staffData.vendorId;
    }
  }

  return undefined;
}

// ============================================================================
// NextAuth Configuration
// ============================================================================

const authOptions: NextAuthConfig = {
  // ========================================
  // Providers
  // ========================================
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        phone: { label: 'Phone', type: 'tel' },
        otp: { label: 'OTP', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials, req) {
        // Validate credentials
        const validation = CredentialsSchema.safeParse(credentials);

        if (!validation.success) {
          throw new Error('Invalid credentials format');
        }

        const { email, phone, otp, role } = validation.data;

        // Ensure at least one identifier is provided
        if (!email && !phone) {
          throw new Error('Email or phone is required');
        }

        // Determine identifier type and value
        const isEmail = !!email;
        const identifier = email || phone!;

        // Verify OTP
        const otpValid = verifyOtp(identifier, otp);
        if (!otpValid) {
          throw new Error('Invalid or expired verification code');
        }

        // Find or create user
        const user = await findOrCreateUser(identifier, role, isEmail);

        // Set custom claims on Firebase Auth token
        await setUserClaims(user.id, role, user.vendorId);

        // Get vendor ID if applicable
        const vendorId = await getVendorId(user.id, role);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          // Custom fields (added to JWT and session)
          role,
          vendorId,
          verified: true,
        };
      },
    }),
  ],

  // ========================================
  // Pages
  // ========================================
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // ========================================
  // Callbacks
  // ========================================
  callbacks: {
    /**
     * JWT Callback - Add custom claims to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'customer';
        token.vendorId = (user as any).vendorId;
        token.verified = (user as any).verified !== false;
      }
      return token;
    },

    /**
     * Session Callback - Add custom claims to session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'vendor' | 'staff' | 'admin';
        session.user.vendorId = token.vendorId as string | undefined;
        session.user.verified = token.verified as boolean;
      }
      return session;
    },

    /**
     * SignIn Callback - Additional validation
     */
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all successful credential verification
      return true;
    },
  },

  // ========================================
  // Session Configuration
  // ========================================
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // ========================================
  // Events
  // ========================================
  events: {
    async signIn(message: any) {
      const user = message.user;
      console.log(`User signed in: ${user?.email || user?.id}`);
    },
    async signOut(message: any) {
      console.log(`User signed out`);
    },
  },

  // ========================================
  // Trust Host
  // ========================================
  trustHost: true,
};

// ============================================================================
// NextAuth Handler
// ============================================================================

const handler = NextAuth(authOptions);

// Export handlers - NextAuth v5 returns a special handler object
// Type assertion is needed for Next.js App Router compatibility
export const GET: any = handler;
export const POST: any = handler;

// ============================================================================
// Exports for use in other files
// ============================================================================

// Export authOptions as a named export (but not at route handler level)
// For external use, import from a separate auth.config.ts file if needed

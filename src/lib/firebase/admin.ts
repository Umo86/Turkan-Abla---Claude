/**
 * Firebase Admin SDK Initialization
 * Initializes Firebase Admin SDK for server-side use with full admin privileges
 * Supports emulator detection for local development
 * This file should only be imported on the server side (API routes, server actions, etc.)
 */

import {
  initializeApp,
  getApp,
  getApps,
  App,
  cert,
  ServiceAccount,
} from 'firebase-admin/app';
import {
  getFirestore,
  Firestore,
} from 'firebase-admin/firestore';
import {
  getAuth,
  Auth,
} from 'firebase-admin/auth';

// ============================================================================
// Credential Handling
// ============================================================================

const getServiceAccountKey = () => {
  // Parse the private key from environment variable
  // The key should be in JSON format as provided by Firebase Console
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      'Firebase Admin SDK is not properly configured. ' +
      'Please ensure FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set.'
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
};

// ============================================================================
// Admin App Initialization
// ============================================================================

let adminApp: App | undefined;

/**
 * Initialize Firebase Admin SDK - only initialize once
 * If admin app is already initialized, return the existing instance
 */
const getAdminApp = (): App => {
  // Check if app is already initialized
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = getServiceAccountKey();

  adminApp = initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    projectId: serviceAccount.projectId,
  });

  return adminApp;
};

// ============================================================================
// Admin Firestore Instance
// ============================================================================

let firestoreDb: Firestore | undefined;

/**
 * Get or create Admin Firestore database instance
 */
export const getAdminDb = (): Firestore => {
  if (firestoreDb) {
    return firestoreDb;
  }

  const app = getAdminApp();
  firestoreDb = getFirestore(app);

  // Connect to emulator in development if available
  if (process.env.NODE_ENV === 'development') {
    const emulatorsDisabled =
      process.env.FIREBASE_EMULATOR_HOST === 'disabled';

    if (!emulatorsDisabled) {
      try {
        const emulatorHost = process.env.FIREBASE_EMULATOR_HOST || 'localhost:8080';
        process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
      } catch (error) {
        console.debug('Firestore Admin Emulator configuration skipped');
      }
    }
  }

  return firestoreDb;
};

// ============================================================================
// Admin Auth Instance
// ============================================================================

let authInstance: Auth | undefined;

/**
 * Get or create Firebase Admin Auth instance
 */
export const getAdminAuth = (): Auth => {
  if (authInstance) {
    return authInstance;
  }

  const app = getAdminApp();
  authInstance = getAuth(app);

  return authInstance;
};

// ============================================================================
// Exported Instances (lazy initialization)
// ============================================================================

/**
 * Firebase Admin Firestore database instance
 * Use for server-side database operations with admin privileges
 * Lazy-initialized on first access to avoid errors during build
 * @example
 * import { adminDb } from '@/lib/firebase/admin';
 * const userRef = adminDb.collection('users').doc(userId);
 * await userRef.update({ role: 'admin' });
 */
let cachedAdminDb: Firestore | null = null;

export const adminDb = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!cachedAdminDb) {
      try {
        cachedAdminDb = getAdminDb();
      } catch (error) {
        console.error('Failed to initialize Firebase Admin Firestore:', error);
        throw error;
      }
    }
    return (cachedAdminDb as any)[prop];
  },
});

/**
 * Firebase Admin Auth instance
 * Use for server-side authentication operations with admin privileges
 * Lazy-initialized on first access to avoid errors during build
 * @example
 * import { adminAuthInstance } from '@/lib/firebase/admin';
 * await adminAuthInstance.setCustomUserClaims(uid, { role: 'admin' });
 */
let cachedAdminAuth: Auth | null = null;

export const adminAuthInstance = new Proxy({} as Auth, {
  get(target, prop) {
    if (!cachedAdminAuth) {
      try {
        cachedAdminAuth = getAdminAuth();
      } catch (error) {
        console.error('Failed to initialize Firebase Admin Auth:', error);
        throw error;
      }
    }
    return (cachedAdminAuth as any)[prop];
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify an ID token (from client-side authentication)
 * Useful for validating requests in API routes
 */
export const verifyIdToken = async (token: string) => {
  const auth = getAdminAuth();
  return auth.verifyIdToken(token);
};

/**
 * Create a custom token for client-side sign-in
 * Useful for server-side authentication flows
 */
export const createCustomToken = async (uid: string, customClaims?: Record<string, unknown>): Promise<string> => {
  const auth = getAdminAuth();
  return auth.createCustomToken(uid, customClaims);
};

/**
 * Get a user by UID
 */
export const getUserByUid = async (uid: string) => {
  const auth = getAdminAuth();
  return auth.getUser(uid);
};

/**
 * Get a user by email
 */
export const getUserByEmail = async (email: string) => {
  const auth = getAdminAuth();
  return auth.getUserByEmail(email);
};

/**
 * Create a new user
 */
export const createUser = async (properties: any) => {
  const auth = getAdminAuth();
  return auth.createUser(properties);
};

/**
 * Update a user
 */
export const updateUser = async (uid: string, properties: any) => {
  const auth = getAdminAuth();
  return auth.updateUser(uid, properties);
};

/**
 * Delete a user
 */
export const deleteUser = async (uid: string): Promise<void> => {
  const auth = getAdminAuth();
  return auth.deleteUser(uid);
};

/**
 * Set custom claims on a user
 */
export const setCustomUserClaims = async (
  uid: string,
  customClaims: Record<string, unknown> | null
): Promise<void> => {
  const auth = getAdminAuth();
  return auth.setCustomUserClaims(uid, customClaims);
};

/**
 * Check if running in emulator mode
 */
export const isEmulatorMode = (): boolean => {
  return process.env.NODE_ENV === 'development' &&
    process.env.FIREBASE_EMULATOR_HOST !== 'disabled';
};

/**
 * Check if Firebase Admin SDK is properly configured
 */
export const isFirebaseAdminConfigured = (): boolean => {
  return !!(
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

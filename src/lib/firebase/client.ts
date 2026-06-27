/**
 * Firebase Client Initialization
 * Initializes Firebase SDK for client-side use with Firestore and Authentication
 * Supports emulator detection for local development
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from 'firebase/firestore';

// ============================================================================
// Environment Variables
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// ============================================================================
// Firebase App Instance
// ============================================================================

let firebaseApp: FirebaseApp;

/**
 * Initialize Firebase app - only initialize once
 * If an app is already initialized, return the existing instance
 */
const getFirebaseApp = (): FirebaseApp => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase configuration is missing. Please check your environment variables.'
    );
  }

  firebaseApp = initializeApp(firebaseConfig);
  return firebaseApp;
};

// ============================================================================
// Auth Instance
// ============================================================================

let authInstance: Auth;

/**
 * Get or create Firebase Auth instance
 */
export const getAuthInstance = (): Auth => {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();
  authInstance = getAuth(app);

  // Connect to emulator in development if available
  if (process.env.NODE_ENV === 'development') {
    const emulatorsDisabled =
      process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST === 'disabled';

    if (!emulatorsDisabled && !authInstance.emulatorConfig) {
      try {
        const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost:9099';
        connectAuthEmulator(authInstance, `http://${emulatorHost}`, {
          disableWarnings: true,
        });
      } catch (error) {
        // Emulator might not be running, which is fine
        console.debug('Firebase Auth Emulator not available');
      }
    }
  }

  return authInstance;
};

// ============================================================================
// Firestore Instance
// ============================================================================

let firestoreInstance: Firestore;

/**
 * Get or create Firestore database instance
 */
export const getFirestoreInstance = (): Firestore => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = getFirebaseApp();
  firestoreInstance = getFirestore(app);

  // Connect to emulator in development if available
  if (process.env.NODE_ENV === 'development') {
    const emulatorsDisabled =
      process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST === 'disabled';

    if (!emulatorsDisabled) {
      try {
        const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost:8080';
        const [host, port] = emulatorHost.split(':');
        connectFirestoreEmulator(firestoreInstance, host, parseInt(port));
      } catch (error) {
        // Emulator might not be running or already connected, which is fine
        console.debug('Firestore Emulator not available');
      }
    }
  }

  return firestoreInstance;
};

// ============================================================================
// Exported Instances (lazy initialization)
// ============================================================================

/**
 * Firebase Auth instance - use for client-side authentication
 * @example
 * import { auth } from '@/lib/firebase/client';
 * const user = auth.currentUser;
 */
export const auth = (() => {
  try {
    return getAuthInstance();
  } catch (error) {
    console.error('Failed to initialize Firebase Auth:', error);
    throw error;
  }
})();

/**
 * Firestore database instance - use for client-side database operations
 * @example
 * import { db } from '@/lib/firebase/client';
 * const snapshot = await getDoc(doc(db, 'users', userId));
 */
export const db = (() => {
  try {
    return getFirestoreInstance();
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    throw error;
  }
})();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if running in emulator mode
 */
export const isEmulatorMode = (): boolean => {
  return process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST !== 'disabled';
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain &&
    firebaseConfig.appId
  );
};

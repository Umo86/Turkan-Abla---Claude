/**
 * Main Firebase exports
 * Re-exports all Firebase types and utilities for easy importing
 */

// Export all types
export * from './types';

// Export client utilities
export { auth, db, isEmulatorMode, isFirebaseConfigured } from './client';

// Export admin utilities
export { adminDb, adminAuthInstance, isFirebaseAdminConfigured } from './admin';

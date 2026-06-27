/**
 * NextAuth Route Handler
 * This file only exports the NextAuth handlers (GET and POST)
 * The configuration is in @/lib/auth/authOptions
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// ============================================================================
// NextAuth Handler
// ============================================================================

const handler = NextAuth(authOptions);

// ============================================================================
// Route Handlers - NextAuth v5 returns a special handler object
// ============================================================================

// Type assertion is needed for Next.js App Router compatibility
export const GET: any = handler;
export const POST: any = handler;

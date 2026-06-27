/**
 * NextAuth Configuration (separated from route handler to avoid export issues)
 * Re-export the authOptions for use in other files
 */

// Note: The actual NextAuth configuration is defined in:
// src/app/api/auth/[...nextauth]/route.ts
//
// This file can be used to import configuration if needed, but since
// authOptions contains server-only code (Firebase Admin SDK), it should
// only be used on the server side.

// For type-safe session access on the client, use:
// import { useSession } from 'next-auth/react';
//
// For type-safe session access on the server, use:
// import { getServerSession } from 'next-auth';
// import { NextRequest } from 'next/server';
//
// const session = await getServerSession();

/**
 * This module serves as documentation for the NextAuth setup.
 * The actual configuration is in src/app/api/auth/[...nextauth]/route.ts
 */

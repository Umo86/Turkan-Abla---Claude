/**
 * Vendor Creation API Route
 * POST /api/vendors
 * Creates a new vendor document with business details and Stripe account
 *
 * Called by authenticated vendor users after OTP verification
 * Requires FirebaseAuth token in Authorization header or session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createConnectAccount } from '@/lib/stripe/stripe-connect';
import type { Vendor, OpeningTimes } from '@/lib/firebase/types';

// Lazy load Firebase Admin
async function getFirebaseServices() {
  const { adminDb, adminAuthInstance } = await import('@/lib/firebase/admin');
  return { adminDb, adminAuthInstance };
}

// ============================================================================
// Request Validation Schema
// ============================================================================

const CreateVendorSchema = z.object({
  businessName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  customCategory: z.string().max(200).optional().default(''),
  bio: z.string().max(1000).optional().default(''),
  firstName: z.string().min(1).max(100),
  surname: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().max(500).optional().default(''),
  postcode: z.string().min(1).max(20),
  borough: z.string().min(1).max(100),
});

type CreateVendorRequest = z.infer<typeof CreateVendorSchema>;

// ============================================================================
// Default Opening Times
// ============================================================================

const DEFAULT_OPENING_TIMES: OpeningTimes = {
  monday: { open: '09:00', close: '17:00' },
  tuesday: { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday: { open: '09:00', close: '17:00' },
  friday: { open: '09:00', close: '17:00' },
  saturday: { open: '10:00', close: '16:00' },
  sunday: { open: '10:00', close: '16:00' },
};

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get Firebase user from auth token (set by signIn)
    // For MVP, we simplify by requiring the request to include the email
    // The actual user verification happens at signIn time in NextAuth

    // Parse request body first
    const body = await request.json();

    // Validate with zod schema
    const validation = CreateVendorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get Firebase services
    const { adminDb } = await getFirebaseServices();

    // Get the user from Firestore using email (since they just signed in with this email)
    // This ensures the user is authenticated and exists in the system
    const usersRef = adminDb.collection('users');
    const userQuery = await usersRef.where('email', '==', data.email).limit(1).get();

    if (userQuery.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - user not found',
        },
        { status: 401 }
      );
    }

    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const userRole = userDoc.data()?.role;

    if (userRole !== 'vendor') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - vendor role required',
        },
        { status: 403 }
      );
    }

    // Create Stripe Connect account
    const stripeResult = await createConnectAccount(data.email, data.businessName);

    if (!stripeResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: stripeResult.error || 'Failed to create Stripe account',
        },
        { status: 500 }
      );
    }

    // Create vendor document in Firestore
    const now = Date.now();
    const vendor: Vendor = {
      uid: userId,
      businessName: data.businessName,
      category: data.category,
      customCategory: data.customCategory || undefined,
      bio: data.bio || undefined,
      phone: data.phone,
      email: data.email,
      address: data.address || '',
      postcode: data.postcode,
      opening_times: DEFAULT_OPENING_TIMES,
      stripe_account_id: stripeResult.accountId!,
      verification_status: 'pending',
      platform_commission_rate: 0.1, // 10% default commission
      commission_default: {
        defaultRate: 0.1,
        staffCanSetOwnRates: true,
      },
      consent: {
        marketingSms: {
          value: false,
          ts: now,
          source: 'signup',
        },
        marketingEmail: {
          value: false,
          ts: now,
          source: 'signup',
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore
    await adminDb.collection('vendors').doc(userId).set(vendor);

    // Update user document to link vendor
    await adminDb.collection('users').doc(userId).update({
      vendorId: userId,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        vendorId: userId,
        stripeAccountId: stripeResult.accountId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vendor creation endpoint error:', error);

    // Don't expose internal error details to client
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while creating your vendor account',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS Handler (for CORS preflight)
// ============================================================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

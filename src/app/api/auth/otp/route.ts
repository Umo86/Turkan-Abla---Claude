/**
 * OTP Request Handler
 * POST /api/auth/otp
 * Initiates OTP verification flow via SMS or Email
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendSmsOtp, sendEmailOtp } from '@/lib/auth/otp';

// ============================================================================
// Request Validation Schema
// ============================================================================

const OtpRequestSchema = z.object({
  channel: z.enum(['sms', 'email']).describe('Verification channel'),
  destination: z.string().min(1).describe('Phone number or email address'),
});

type OtpRequest = z.infer<typeof OtpRequestSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic)
 */
function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10;
}

/**
 * Sanitize phone number to E.164 format
 */
function sanitizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present (UK/Turkey convention)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Add country code if not present
  if (!cleaned.startsWith('1') && !cleaned.startsWith('44') && !cleaned.startsWith('90')) {
    // Default to +44 (UK) if no country code
    cleaned = '44' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Check rate limiting (basic implementation)
 * In production, use Redis or a proper rate limiting service
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 5, windowMinutes: number = 15): boolean {
  const now = Date.now();
  const key = `otp:${identifier}`;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMinutes * 60 * 1000 });
    return true;
  }

  const record = requestCounts.get(key)!;

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMinutes * 60 * 1000;
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with zod schema
    const validation = OtpRequestSchema.safeParse(body);

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

    const { channel, destination } = validation.data;

    // Validate channel-specific destination format
    if (channel === 'email') {
      if (!isValidEmail(destination)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid email address format',
          },
          { status: 400 }
        );
      }
    } else if (channel === 'sms') {
      if (!isValidPhone(destination)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid phone number format',
          },
          { status: 400 }
        );
      }
    }

    // Check rate limiting
    if (!checkRateLimit(destination)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Send OTP based on channel
    let result;

    if (channel === 'email') {
      result = await sendEmailOtp(destination);
    } else {
      const sanitized = sanitizePhone(destination);
      result = await sendSmsOtp(sanitized);
    }

    // Return response
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: `Verification code sent to ${channel === 'email' ? 'email' : 'SMS'}`,
          // Include code in development for testing
          ...(process.env.NODE_ENV === 'development' && result.code && { code: result.code }),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send verification code',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OTP endpoint error:', error);

    // Don't expose internal error details to client
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request',
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

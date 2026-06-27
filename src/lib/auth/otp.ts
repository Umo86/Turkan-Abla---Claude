/**
 * OTP Service for SMS and Email Verification
 * Generates, stores, and verifies one-time passwords (OTPs)
 * Uses in-memory storage with expiration (10 minutes)
 * Note: In production, use Redis for distributed cache
 */

import { Twilio } from 'twilio';
import { Resend } from 'resend';

// ============================================================================
// Types
// ============================================================================

export interface OtpRecord {
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

export interface SendOtpResult {
  success: boolean;
  error?: string;
  code?: string; // Only in development/testing
}

// ============================================================================
// Configuration
// ============================================================================

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const MAX_ATTEMPTS = 5;

// ============================================================================
// In-Memory OTP Store
// ============================================================================

class OtpStore {
  private store: Map<string, OtpRecord> = new Map();

  /**
   * Generate a random OTP code
   */
  private generateCode(): string {
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(OTP_LENGTH, '0');
  }

  /**
   * Store an OTP for an identifier (email or phone)
   */
  storeOtp(identifier: string, code: string): OtpRecord {
    const now = Date.now();
    const record: OtpRecord = {
      code,
      createdAt: now,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    };

    this.store.set(identifier, record);
    return record;
  }

  /**
   * Retrieve an OTP record
   */
  getOtp(identifier: string): OtpRecord | null {
    const record = this.store.get(identifier);
    if (!record) return null;

    // Check if expired
    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      return null;
    }

    return record;
  }

  /**
   * Verify an OTP code
   */
  verifyOtp(identifier: string, code: string): boolean {
    const record = this.getOtp(identifier);
    if (!record) return false;

    // Check if expired
    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      return false;
    }

    // Check if max attempts exceeded
    if (record.attempts >= record.maxAttempts) {
      this.store.delete(identifier);
      return false;
    }

    // Increment attempts
    record.attempts++;

    // Check if code matches
    if (record.code === code) {
      // Remove OTP after successful verification
      this.store.delete(identifier);
      return true;
    }

    return false;
  }

  /**
   * Delete an OTP record
   */
  deleteOtp(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clean up expired OTPs (called periodically)
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [identifier, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(identifier);
      }
    }
  }

  /**
   * Get remaining TTL in seconds
   */
  getTtl(identifier: string): number {
    const record = this.store.get(identifier);
    if (!record) return 0;

    const remaining = record.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

// ============================================================================
// OTP Service
// ============================================================================

class OtpService {
  private store: OtpStore;
  private twilio: Twilio | null;
  private resend: Resend | null;

  constructor() {
    this.store = new OtpStore();

    // Initialize Twilio if credentials are available
    if (process.env.TWILIO_AUTH_TOKEN && process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID) {
      this.twilio = new Twilio(
        process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      this.twilio = null;
    }

    // Initialize Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      this.resend = null;
    }

    // Clean up expired OTPs every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.store.cleanupExpired();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Generate and send OTP via SMS
   */
  async sendSmsOtp(phone: string): Promise<SendOtpResult> {
    try {
      // Validate phone number format (basic validation)
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Generate OTP code
      const code = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(OTP_LENGTH, '0');

      // Store OTP
      this.store.storeOtp(phone, code);

      // Send via Twilio if available
      if (this.twilio) {
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        if (!twilioPhone) {
          return {
            success: false,
            error: 'Twilio phone number not configured',
          };
        }

        await this.twilio.messages.create({
          body: `Your Turkan Abla verification code is: ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
          from: twilioPhone,
          to: phone.startsWith('+') ? phone : `+${cleanPhone}`,
        });
      } else {
        // Log OTP in development without Twilio
        console.log(`[DEV] SMS OTP for ${phone}: ${code}`);
      }

      return {
        success: true,
        code: process.env.NODE_ENV === 'development' ? code : undefined,
      };
    } catch (error) {
      console.error('Failed to send SMS OTP:', error);
      return {
        success: false,
        error: 'Failed to send SMS verification code',
      };
    }
  }

  /**
   * Generate and send OTP via Email
   */
  async sendEmailOtp(email: string): Promise<SendOtpResult> {
    try {
      // Validate email format (basic validation)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Invalid email address',
        };
      }

      // Generate OTP code
      const code = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(OTP_LENGTH, '0');

      // Store OTP
      this.store.storeOtp(email, code);

      // Send via Resend if available
      if (this.resend) {
        const senderEmail = process.env.RESEND_FROM_EMAIL || 'noreply@turkanabia.com';

        await this.resend.emails.send({
          from: senderEmail,
          to: email,
          subject: 'Your Turkan Abla Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Verify Your Email</h2>
              <p>Your verification code is:</p>
              <div style="background: #f0f0f0; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                ${code}
              </div>
              <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });
      } else {
        // Log OTP in development without Resend
        console.log(`[DEV] Email OTP for ${email}: ${code}`);
      }

      return {
        success: true,
        code: process.env.NODE_ENV === 'development' ? code : undefined,
      };
    } catch (error) {
      console.error('Failed to send Email OTP:', error);
      return {
        success: false,
        error: 'Failed to send email verification code',
      };
    }
  }

  /**
   * Verify an OTP code
   */
  verifyOtp(identifier: string, code: string): boolean {
    return this.store.verifyOtp(identifier, code);
  }

  /**
   * Get remaining OTP expiry in seconds
   */
  getOtpTtl(identifier: string): number {
    return this.store.getTtl(identifier);
  }

  /**
   * Manually delete an OTP (for testing)
   */
  deleteOtp(identifier: string): void {
    this.store.deleteOtp(identifier);
  }

  /**
   * Check if OTP exists
   */
  hasOtp(identifier: string): boolean {
    return this.store.getOtp(identifier) !== null;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let otpServiceInstance: OtpService | null = null;

/**
 * Get the OTP service singleton instance
 */
export function getOtpService(): OtpService {
  if (!otpServiceInstance) {
    otpServiceInstance = new OtpService();
  }
  return otpServiceInstance;
}

/**
 * Export commonly used functions
 */
export const sendSmsOtp = (phone: string): Promise<SendOtpResult> => {
  return getOtpService().sendSmsOtp(phone);
};

export const sendEmailOtp = (email: string): Promise<SendOtpResult> => {
  return getOtpService().sendEmailOtp(email);
};

export const verifyOtp = (identifier: string, code: string): boolean => {
  return getOtpService().verifyOtp(identifier, code);
};

export const getOtpTtl = (identifier: string): number => {
  return getOtpService().getOtpTtl(identifier);
};

// Export for testing purposes
export { OtpService, OtpStore };

/**
 * OTP Verification Component (Vendor)
 * Handles email OTP verification for vendor signup
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================================
// Type Definitions
// ============================================================================

export interface OtpVerificationProps {
  destination: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
  error: string;
}

// ============================================================================
// Component
// ============================================================================

export function OtpVerification({
  destination,
  onSubmit,
  onResend,
  loading,
  error,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ========================================
  // Resend Timer Effect
  // ========================================

  useEffect(() => {
    if (resendTimer <= 0) {
      setResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setResendTimer(resendTimer - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  // ========================================
  // Handlers
  // ========================================

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (otp.length !== 6) {
        return;
      }

      await onSubmit(otp);
    },
    [otp, onSubmit]
  );

  const handleResend = useCallback(async () => {
    setResendDisabled(true);
    setResendTimer(60);
    await onResend();
  }, [onResend]);

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  }, []);

  // ========================================
  // Render
  // ========================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit code to <strong>{destination}</strong>
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* OTP Input */}
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Verification Code *
          </label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            disabled={loading}
            className="text-center text-2xl tracking-widest"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the 6-digit code sent to your email
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full"
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </Button>

      {/* Resend Button */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendDisabled || loading}
            className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendDisabled ? `Resend in ${resendTimer}s` : 'Resend code'}
          </button>
        </p>
      </div>
    </form>
  );
}

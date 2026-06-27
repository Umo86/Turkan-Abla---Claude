/**
 * OTP Verification Component
 * Fourth step: Enter 6-digit OTP and verify
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export interface OtpVerificationProps {
  channel: 'sms' | 'email';
  destination: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  loading?: boolean;
  error?: string;
}

export function OtpVerification({
  channel,
  destination,
  onSubmit,
  onResend,
  loading = false,
  error = '',
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // ========================================
  // Auto-focus OTP input
  // ========================================

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  // ========================================
  // Resend Timer
  // ========================================

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  // ========================================
  // OTP Input Handler
  // ========================================

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  }, []);

  // ========================================
  // Submit Handler
  // ========================================

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (otp.length !== 6) {
        return;
      }

      onSubmit(otp);
    },
    [otp, onSubmit]
  );

  // ========================================
  // Resend Handler
  // ========================================

  const handleResend = useCallback(async () => {
    setCanResend(false);
    setResendTimer(60);
    setOtp('');
    await onResend();
    otpInputRef.current?.focus();
  }, [onResend]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Verify your {channel === 'sms' ? 'phone number' : 'email'}
        </h3>
        <p className="text-sm text-slate-600">
          We sent a code to <span className="font-semibold">{destination}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
            Verification Code
          </label>
          <input
            ref={otpInputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            disabled={loading}
            className="w-full px-4 py-3 text-2xl text-center tracking-widest font-mono border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>

        <p className="text-xs text-slate-600 text-center">
          Enter the 6-digit code
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>

      <div className="text-center">
        {!canResend && resendTimer > 0 ? (
          <p className="text-sm text-slate-600">
            Didn't receive the code? Resend in{' '}
            <span className="font-semibold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || !canResend}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed font-medium"
          >
            Resend Code
          </button>
        )}
      </div>
    </form>
  );
}

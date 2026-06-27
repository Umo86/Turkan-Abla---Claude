/**
 * Customer Signup Page
 * Multi-step signup flow: channel → details → consent → OTP verification
 */

'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChannelSelection } from './components/channel-selection';
import { DetailsForm } from './components/details-form';
import { ConsentForm } from './components/consent-form';
import { OtpVerification } from './components/otp-verification';

// ============================================================================
// Constants
// ============================================================================

const LONDON_BOROUGHS = [
  'Barking and Dagenham',
  'Barnet',
  'Bexley',
  'Brent',
  'Bromley',
  'Camden',
  'Croydon',
  'Ealing',
  'Enfield',
  'Greenwich',
  'Hackney',
  'Hammersmith and Fulham',
  'Haringey',
  'Harrow',
  'Havering',
  'Hillingdon',
  'Hounslow',
  'Islington',
  'Kensington and Chelsea',
  'Kingston upon Thames',
  'Lambeth',
  'Lewisham',
  'Merton',
  'Newham',
  'Redbridge',
  'Richmond upon Thames',
  'Southwark',
  'Sutton',
  'Tower Hamlets',
  'Waltham Forest',
  'Wandsworth',
  'Westminster',
];

// ============================================================================
// Type Definitions
// ============================================================================

export interface SignupState {
  step: 'channel' | 'details' | 'consent' | 'otp';
  channel: 'sms' | 'email' | '';
  firstName: string;
  surname: string;
  phone: string;
  email: string;
  borough: string;
  postcode: string;
  otp: string;
  consent: {
    vendorMarketingSms: boolean;
    vendorMarketingEmail: boolean;
    platformDealsSms: boolean;
    platformDealsEmail: boolean;
  };
  loading: boolean;
  error: string;
  success: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function CustomerSignupPage() {
  const router = useRouter();
  const [state, setState] = useState<SignupState>({
    step: 'channel',
    channel: '',
    firstName: '',
    surname: '',
    phone: '',
    email: '',
    borough: '',
    postcode: '',
    otp: '',
    consent: {
      vendorMarketingSms: false,
      vendorMarketingEmail: false,
      platformDealsSms: false,
      platformDealsEmail: false,
    },
    loading: false,
    error: '',
    success: false,
  });

  // ========================================
  // Channel Selection Handler
  // ========================================

  const handleChannelSelect = useCallback((channel: 'sms' | 'email') => {
    setState((prev) => ({
      ...prev,
      channel,
      step: 'details',
      error: '',
    }));
  }, []);

  // ========================================
  // Details Form Handler
  // ========================================

  const handleDetailsSubmit = useCallback(
    async (details: {
      firstName: string;
      surname: string;
      phone?: string;
      email?: string;
      borough: string;
      postcode: string;
    }) => {
      setState((prev) => ({
        ...prev,
        ...details,
        step: 'consent',
        error: '',
      }));
    },
    []
  );

  // ========================================
  // Consent Form Handler
  // ========================================

  const handleConsentSubmit = useCallback(async (consent: SignupState['consent']) => {
    setState((prev) => ({
      ...prev,
      consent,
      loading: true,
      error: '',
    }));

    try {
      // Determine identifier based on channel
      const destination = state.channel === 'sms' ? state.phone : state.email;

      // Call OTP API to send verification code
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: state.channel,
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setState((prev) => ({
        ...prev,
        step: 'otp',
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to send verification code',
      }));
    }
  }, [state.channel, state.phone, state.email]);

  // ========================================
  // OTP Verification Handler
  // ========================================

  const handleOtpSubmit = useCallback(
    async (otp: string) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: '',
      }));

      try {
        // Prepare credentials for signIn
        const credentials = {
          otp,
          role: 'customer',
          ...(state.channel === 'email' ? { email: state.email } : { phone: state.phone }),
        };

        // Call NextAuth signIn with credentials
        const result = await signIn('credentials', {
          ...credentials,
          redirect: false,
        });

        if (!result?.ok) {
          throw new Error(result?.error || 'Invalid verification code');
        }

        // Success - redirect to customer home
        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
        }));

        // Redirect to customer home
        router.push('/customer/home');
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : 'Verification failed',
        }));
      }
    },
    [state.channel, state.email, state.phone, router]
  );

  // ========================================
  // Resend OTP Handler
  // ========================================

  const handleResendOtp = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      const destination = state.channel === 'sms' ? state.phone : state.email;

      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: state.channel,
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code');
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: '',
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to resend verification code',
      }));
    }
  }, [state.channel, state.phone, state.email]);

  // ========================================
  // Back Handler
  // ========================================

  const handleBack = useCallback(() => {
    if (state.step === 'details') {
      setState((prev) => ({
        ...prev,
        step: 'channel',
        channel: '',
        error: '',
      }));
    } else if (state.step === 'consent') {
      setState((prev) => ({
        ...prev,
        step: 'details',
        error: '',
      }));
    } else if (state.step === 'otp') {
      setState((prev) => ({
        ...prev,
        step: 'consent',
        error: '',
      }));
    }
  }, [state.step]);

  // ========================================
  // Render Steps
  // ========================================

  return (
    <div>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Channel Selection Step */}
        {state.step === 'channel' && (
          <ChannelSelection
            onSelect={handleChannelSelect}
            loading={state.loading}
          />
        )}

        {/* Details Form Step */}
        {state.step === 'details' && (
          <DetailsForm
            channel={state.channel as 'sms' | 'email'}
            initialData={{
              firstName: state.firstName,
              surname: state.surname,
              phone: state.phone,
              email: state.email,
              borough: state.borough,
              postcode: state.postcode,
            }}
            boroughs={LONDON_BOROUGHS}
            onSubmit={handleDetailsSubmit}
            onBack={handleBack}
            loading={state.loading}
            error={state.error}
          />
        )}

        {/* Consent Form Step */}
        {state.step === 'consent' && (
          <ConsentForm
            channel={state.channel as 'sms' | 'email'}
            destination={state.channel === 'sms' ? state.phone : state.email}
            initialConsent={state.consent}
            onSubmit={handleConsentSubmit}
            onBack={handleBack}
            loading={state.loading}
            error={state.error}
          />
        )}

        {/* OTP Verification Step */}
        {state.step === 'otp' && (
          <OtpVerification
            channel={state.channel as 'sms' | 'email'}
            destination={state.channel === 'sms' ? state.phone : state.email}
            onSubmit={handleOtpSubmit}
            onResend={handleResendOtp}
            loading={state.loading}
            error={state.error}
          />
        )}
      </CardContent>
    </div>
  );
}

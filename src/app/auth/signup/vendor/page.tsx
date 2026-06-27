/**
 * Vendor Signup Page
 * Multi-step signup flow: details → address → OTP verification → Stripe onboarding
 */

'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessDetailsForm } from './components/business-details-form';
import { AddressForm } from './components/address-form';
import { OtpVerification } from './components/otp-verification';

// ============================================================================
// Constants
// ============================================================================

const BUSINESS_CATEGORIES = [
  'Nail Salon',
  'Hair Salon',
  'Beauty',
  'Massage',
  'Spa',
  'Personal Trainer',
  'Pet Grooming',
  'Tattoo',
  'Other',
];

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

export interface VendorSignupState {
  step: 'details' | 'address' | 'otp' | 'stripe';
  businessName: string;
  category: string;
  customCategory: string;
  bio: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  borough: string;
  otp: string;
  loading: boolean;
  error: string;
  success: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function VendorSignupPage() {
  const router = useRouter();
  const [state, setState] = useState<VendorSignupState>({
    step: 'details',
    businessName: '',
    category: '',
    customCategory: '',
    bio: '',
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    borough: '',
    otp: '',
    loading: false,
    error: '',
    success: false,
  });

  // ========================================
  // Business Details Handler
  // ========================================

  const handleDetailsSubmit = useCallback(
    async (details: {
      businessName: string;
      category: string;
      customCategory: string;
      bio: string;
      firstName: string;
      surname: string;
      email: string;
      phone: string;
    }) => {
      setState((prev) => ({
        ...prev,
        ...details,
        step: 'address',
        error: '',
      }));
    },
    []
  );

  // ========================================
  // Address Form Handler
  // ========================================

  const handleAddressSubmit = useCallback(
    async (address: {
      address: string;
      postcode: string;
      borough: string;
    }) => {
      setState((prev) => ({
        ...prev,
        ...address,
        loading: true,
        error: '',
      }));

      try {
        // Call OTP API to send verification code
        const response = await fetch('/api/auth/otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: 'email',
            destination: state.email,
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
    },
    [state.email]
  );

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
        // Call NextAuth signIn with credentials
        const result = await signIn('credentials', {
          email: state.email,
          otp,
          role: 'vendor',
          redirect: false,
        });

        if (!result?.ok) {
          throw new Error(result?.error || 'Invalid verification code');
        }

        // OTP verified - now create vendor document
        const vendorResponse = await fetch('/api/vendors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: state.businessName,
            category: state.category,
            customCategory: state.customCategory,
            bio: state.bio,
            firstName: state.firstName,
            surname: state.surname,
            email: state.email,
            phone: state.phone,
            address: state.address,
            postcode: state.postcode,
            borough: state.borough,
          }),
        });

        const vendorData = await vendorResponse.json();

        if (!vendorResponse.ok) {
          throw new Error(vendorData.error || 'Failed to create vendor account');
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          step: 'stripe',
        }));

        // Redirect to vendor onboarding dashboard
        // For now, redirect to vendor home (Stripe onboarding in Task 3.2)
        router.push('/vendor/home');
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : 'Verification failed',
        }));
      }
    },
    [state.email, state.businessName, state.category, state.customCategory, state.bio, state.firstName, state.surname, state.phone, state.address, state.postcode, state.borough, router]
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
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'email',
          destination: state.email,
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
  }, [state.email]);

  // ========================================
  // Back Handler
  // ========================================

  const handleBack = useCallback(() => {
    if (state.step === 'address') {
      setState((prev) => ({
        ...prev,
        step: 'details',
        error: '',
      }));
    } else if (state.step === 'otp') {
      setState((prev) => ({
        ...prev,
        step: 'address',
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
        <CardTitle>Register Your Business</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Business Details Step */}
        {state.step === 'details' && (
          <BusinessDetailsForm
            categories={BUSINESS_CATEGORIES}
            initialData={{
              businessName: state.businessName,
              category: state.category,
              customCategory: state.customCategory,
              bio: state.bio,
              firstName: state.firstName,
              surname: state.surname,
              email: state.email,
              phone: state.phone,
            }}
            onSubmit={handleDetailsSubmit}
            loading={state.loading}
            error={state.error}
          />
        )}

        {/* Address Form Step */}
        {state.step === 'address' && (
          <AddressForm
            boroughs={LONDON_BOROUGHS}
            initialData={{
              address: state.address,
              postcode: state.postcode,
              borough: state.borough,
            }}
            onSubmit={handleAddressSubmit}
            onBack={handleBack}
            loading={state.loading}
            error={state.error}
          />
        )}

        {/* OTP Verification Step */}
        {state.step === 'otp' && (
          <OtpVerification
            destination={state.email}
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

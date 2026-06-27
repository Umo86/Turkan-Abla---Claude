/**
 * Consent Form Component
 * Third step: Collect consent preferences (4 unbundled, all unchecked by default)
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface ConsentFormProps {
  channel: 'sms' | 'email';
  destination: string;
  initialConsent: {
    vendorMarketingSms: boolean;
    vendorMarketingEmail: boolean;
    platformDealsSms: boolean;
    platformDealsEmail: boolean;
  };
  onSubmit: (consent: ConsentFormProps['initialConsent']) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export function ConsentForm({
  channel,
  destination,
  initialConsent,
  onSubmit,
  onBack,
  loading = false,
  error = '',
}: ConsentFormProps) {
  const [consent, setConsent] = useState(initialConsent);

  // ========================================
  // Consent Change Handler
  // ========================================

  const handleConsentChange = useCallback(
    (key: keyof typeof consent) => {
      setConsent((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );

  // ========================================
  // Submit Handler
  // ========================================

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(consent);
    },
    [consent, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Marketing Preferences
        </h3>
        <p className="text-sm text-slate-600">
          We'll send your verification code to{' '}
          <span className="font-semibold">{destination}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
        <Checkbox
          id="vendorMarketingSms"
          label="Receive marketing SMS from vendors"
          checked={consent.vendorMarketingSms}
          onChange={() => handleConsentChange('vendorMarketingSms')}
          disabled={loading}
        />

        <Checkbox
          id="vendorMarketingEmail"
          label="Receive marketing emails from vendors"
          checked={consent.vendorMarketingEmail}
          onChange={() => handleConsentChange('vendorMarketingEmail')}
          disabled={loading}
        />

        <Checkbox
          id="platformDealsSms"
          label="Receive platform deals via SMS"
          checked={consent.platformDealsSms}
          onChange={() => handleConsentChange('platformDealsSms')}
          disabled={loading}
        />

        <Checkbox
          id="platformDealsEmail"
          label="Receive platform deals via email"
          checked={consent.platformDealsEmail}
          onChange={() => handleConsentChange('platformDealsEmail')}
          disabled={loading}
        />
      </div>

      <div className="text-xs text-slate-600 pt-2">
        <p>
          By signing up, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </div>
    </form>
  );
}

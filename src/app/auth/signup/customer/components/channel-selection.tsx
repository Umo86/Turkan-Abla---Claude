/**
 * Channel Selection Component
 * First step: Choose SMS or Email for verification
 */

'use client';

import { Button } from '@/components/ui/button';

export interface ChannelSelectionProps {
  onSelect: (channel: 'sms' | 'email') => void;
  loading?: boolean;
}

export function ChannelSelection({ onSelect, loading = false }: ChannelSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          How would you like to verify?
        </h3>
        <p className="text-sm text-slate-600">
          Choose your preferred verification method
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('sms')}
          disabled={loading}
          className="w-full p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="font-semibold text-slate-900">SMS Verification</div>
          <div className="text-sm text-slate-600 mt-1">
            Get a code via text message
          </div>
        </button>

        <button
          onClick={() => onSelect('email')}
          disabled={loading}
          className="w-full p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="font-semibold text-slate-900">Email Verification</div>
          <div className="text-sm text-slate-600 mt-1">
            Get a code via email
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * Address Form Component
 * Collects business address, postcode, and London borough
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AddressFormProps {
  boroughs: string[];
  initialData: {
    address: string;
    postcode: string;
    borough: string;
  };
  onSubmit: (data: {
    address: string;
    postcode: string;
    borough: string;
  }) => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

// ============================================================================
// Component
// ============================================================================

export function AddressForm({
  boroughs,
  initialData,
  onSubmit,
  onBack,
  loading,
  error,
}: AddressFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========================================
  // Validation
  // ========================================

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!isValidPostcode(formData.postcode)) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }

    if (!formData.borough) {
      newErrors.borough = 'London borough is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ========================================
  // Handlers
  // ========================================

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      onSubmit(formData);
    },
    [formData, validateForm, onSubmit]
  );

  // ========================================
  // Render
  // ========================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Business Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Business Address
          </label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main Street"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional - can be updated later
          </p>
        </div>

        {/* Postcode */}
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
            Postcode *
          </label>
          <Input
            id="postcode"
            type="text"
            placeholder="SW1A 1AA"
            value={formData.postcode}
            onChange={(e) => handleChange('postcode', e.target.value)}
            disabled={loading}
          />
          {errors.postcode && (
            <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
          )}
        </div>

        {/* London Borough */}
        <div>
          <label htmlFor="borough" className="block text-sm font-medium text-gray-700">
            London Borough *
          </label>
          <Select
            id="borough"
            label=""
            value={formData.borough}
            onChange={(e) => handleChange('borough', e.target.value)}
            disabled={loading}
            options={boroughs.map((borough) => ({ value: borough, label: borough }))}
            placeholder="Select your London borough"
          />
          {errors.borough && (
            <p className="mt-1 text-sm text-red-600">{errors.borough}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidPostcode(postcode: string): boolean {
  // Basic UK postcode validation (very simplified)
  // In production, use a proper postcode validation library
  const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?[\s]?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(postcode.replace(/\s/g, ''));
}

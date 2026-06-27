/**
 * Business Details Form Component
 * Collects business name, category, owner details, and contact info
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// ============================================================================
// Type Definitions
// ============================================================================

export interface BusinessDetailsFormProps {
  categories: string[];
  initialData: {
    businessName: string;
    category: string;
    customCategory: string;
    bio: string;
    firstName: string;
    surname: string;
    email: string;
    phone: string;
  };
  onSubmit: (data: {
    businessName: string;
    category: string;
    customCategory: string;
    bio: string;
    firstName: string;
    surname: string;
    email: string;
    phone: string;
  }) => void;
  loading: boolean;
  error: string;
}

// ============================================================================
// Component
// ============================================================================

export function BusinessDetailsForm({
  categories,
  initialData,
  onSubmit,
  loading,
  error,
}: BusinessDetailsFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========================================
  // Validation
  // ========================================

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Business category is required';
    }

    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Please specify your business type';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Phone number must be at least 10 digits';
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
        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name *
          </label>
          <Input
            id="businessName"
            type="text"
            placeholder="Your Business Name"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            disabled={loading}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
          )}
        </div>

        {/* Business Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Business Category *
          </label>
          <Select
            id="category"
            label=""
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={loading}
            options={categories.map((cat) => ({ value: cat, label: cat }))}
            placeholder="Select your business category"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Custom Category (if Other is selected) */}
        {formData.category === 'Other' && (
          <div>
            <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">
              What type of business? *
            </label>
            <Input
              id="customCategory"
              type="text"
              placeholder="Describe your business"
              value={formData.customCategory}
              onChange={(e) => handleChange('customCategory', e.target.value)}
              disabled={loading}
            />
            {errors.customCategory && (
              <p className="mt-1 text-sm text-red-600">{errors.customCategory}</p>
            )}
          </div>
        )}

        {/* Bio/Description */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Business Description
          </label>
          <textarea
            id="bio"
            placeholder="Tell customers about your business (optional)"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            disabled={loading}
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            disabled={loading}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Surname */}
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
            Surname *
          </label>
          <Input
            id="surname"
            type="text"
            placeholder="Doe"
            value={formData.surname}
            onChange={(e) => handleChange('surname', e.target.value)}
            disabled={loading}
          />
          {errors.surname && (
            <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+44 7..."
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={loading}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : 'Continue'}
      </Button>
    </form>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10;
}

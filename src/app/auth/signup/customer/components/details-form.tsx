/**
 * Details Form Component
 * Second step: Collect personal information (name, phone/email, borough, postcode)
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export interface DetailsFormProps {
  channel: 'sms' | 'email';
  initialData: {
    firstName: string;
    surname: string;
    phone: string;
    email: string;
    borough: string;
    postcode: string;
  };
  boroughs: string[];
  onSubmit: (details: {
    firstName: string;
    surname: string;
    phone?: string;
    email?: string;
    borough: string;
    postcode: string;
  }) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export function DetailsForm({
  channel,
  initialData,
  boroughs,
  onSubmit,
  onBack,
  loading = false,
  error = '',
}: DetailsFormProps) {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [surname, setSurname] = useState(initialData.surname);
  const [phone, setPhone] = useState(initialData.phone);
  const [email, setEmail] = useState(initialData.email);
  const [borough, setBorough] = useState(initialData.borough);
  const [postcode, setPostcode] = useState(initialData.postcode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========================================
  // Validation
  // ========================================

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (channel === 'sms') {
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (!borough) {
      newErrors.borough = 'Borough is required';
    }

    if (!postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, surname, phone, email, borough, postcode, channel]);

  // ========================================
  // Submit Handler
  // ========================================

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      onSubmit({
        firstName,
        surname,
        ...(channel === 'sms' ? { phone } : { email }),
        borough,
        postcode,
      });
    },
    [firstName, surname, phone, email, borough, postcode, channel, validateForm, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Tell us about yourself
        </h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="firstName"
          label="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
          placeholder="John"
          disabled={loading}
        />

        <Input
          id="surname"
          label="Surname"
          type="text"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          error={errors.surname}
          placeholder="Doe"
          disabled={loading}
        />
      </div>

      {channel === 'sms' ? (
        <Input
          id="phone"
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="+44 7..."
          disabled={loading}
        />
      ) : (
        <Input
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="john@example.com"
          disabled={loading}
        />
      )}

      <Select
        id="borough"
        label="London Borough"
        value={borough}
        onChange={(e) => setBorough(e.target.value)}
        error={errors.borough}
        options={boroughs.map((b) => ({ value: b, label: b }))}
        placeholder="Select your borough"
        disabled={loading}
      />

      <Input
        id="postcode"
        label="Postcode"
        type="text"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
        error={errors.postcode}
        placeholder="SW1A 1AA"
        disabled={loading}
      />

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
          {loading ? 'Loading...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}

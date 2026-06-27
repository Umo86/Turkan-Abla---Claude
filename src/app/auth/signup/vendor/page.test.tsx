/**
 * Tests for Vendor Signup Page
 * Verifies multi-step form transitions, validation, and vendor creation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import VendorSignupPage from './page';

// Mock NextAuth
jest.mock('next-auth/react');
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockRouter = {
  push: jest.fn(),
};
(useRouter as jest.Mock).mockReturnValue(mockRouter);

// Mock fetch globally
global.fetch = jest.fn();

describe('Vendor Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Business Details Step', () => {
    it('renders the business details form initially', () => {
      render(<VendorSignupPage />);

      expect(screen.getByText('Register Your Business')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Business Name')).toBeInTheDocument();
    });

    it('shows all 9 business categories', async () => {
      render(<VendorSignupPage />);

      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const options = Array.from(categorySelect.options).map((opt) => opt.value);

      const expectedCategories = [
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

      expectedCategories.forEach((cat) => {
        expect(options).toContain(cat);
      });
    });

    it('shows custom category input when "Other" is selected', async () => {
      render(<VendorSignupPage />);

      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'Other' } });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Describe your business')).toBeInTheDocument();
      });
    });

    it('validates required business details fields', async () => {
      render(<VendorSignupPage />);

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Business name is required')).toBeInTheDocument();
        expect(screen.getByText('Business category is required')).toBeInTheDocument();
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '12345' } }); // Too short

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument();
      });
    });

    it('transitions to address step on valid input', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('SW1A 1AA')).toBeInTheDocument();
      });
    });
  });

  describe('Address Step', () => {
    it('shows address form after business details', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('SW1A 1AA')).toBeInTheDocument();
      });
    });

    it('contains all 32 London boroughs', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Select your London borough')).toBeInTheDocument();
      });

      const boroughSelect = screen.getByDisplayValue('Select your London borough') as HTMLSelectElement;
      const options = Array.from(boroughSelect.options).map((opt) => opt.value);

      const expectedBoroughs = [
        'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley', 'Camden', 'Croydon', 'Ealing',
        'Enfield', 'Greenwich', 'Hackney', 'Hammersmith and Fulham', 'Haringey', 'Harrow', 'Havering',
        'Hillingdon', 'Hounslow', 'Islington', 'Kensington and Chelsea', 'Kingston upon Thames', 'Lambeth',
        'Lewisham', 'Merton', 'Newham', 'Redbridge', 'Richmond upon Thames', 'Southwark', 'Sutton',
        'Tower Hamlets', 'Waltham Forest', 'Wandsworth', 'Westminster',
      ];

      expectedBoroughs.forEach((borough) => {
        expect(options).toContain(borough);
      });
    });

    it('validates postcode format', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;
        fireEvent.change(postcodeInput, { target: { value: 'invalid' } });
      });

      const boroughSelect = screen.getByDisplayValue('Select your London borough') as HTMLSelectElement;
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });

      const continueButtons = screen.getAllByRole('button', { name: /Continue/i });
      fireEvent.click(continueButtons[continueButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid UK postcode')).toBeInTheDocument();
      });
    });

    it('requires London borough selection', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;
        fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });
      });

      const continueButtons = screen.getAllByRole('button', { name: /Continue/i });
      fireEvent.click(continueButtons[continueButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('London borough is required')).toBeInTheDocument();
      });
    });

    it('allows back navigation to business details', async () => {
      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Your Business Name')).toBeInTheDocument();
      });
    });
  });

  describe('OTP Verification Step', () => {
    it('calls OTP API when address is submitted', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('SW1A 1AA')).toBeInTheDocument();
      });

      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your London borough') as HTMLSelectElement;
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });

      const continueButtons = screen.getAllByRole('button', { name: /Continue/i });
      fireEvent.click(continueButtons[continueButtons.length - 1]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/otp', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('john@example.com'),
        }));
      });
    });

    it('calls signIn with vendor role when OTP is submitted', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, vendorId: 'vendor123' }),
      });

      mockSignIn.mockResolvedValueOnce({
        ok: true,
        error: null,
      } as any);

      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      let continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('SW1A 1AA')).toBeInTheDocument();
      });

      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your London borough') as HTMLSelectElement;
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });

      const continueButtons = screen.getAllByRole('button', { name: /Continue/i });
      fireEvent.click(continueButtons[continueButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const verifyButton = screen.getByRole('button', { name: /Verify Code/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
          otp: '123456',
          role: 'vendor',
          email: 'john@example.com',
        }));
      });
    });

    it('redirects to vendor home on successful verification', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, vendorId: 'vendor123' }),
      });

      mockSignIn.mockResolvedValueOnce({
        ok: true,
        error: null,
      } as any);

      render(<VendorSignupPage />);

      const businessNameInput = screen.getByPlaceholderText('Your Business Name') as HTMLInputElement;
      const categorySelect = screen.getByDisplayValue('Select your business category') as HTMLSelectElement;
      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;

      fireEvent.change(businessNameInput, { target: { value: 'My Salon' } });
      fireEvent.change(categorySelect, { target: { value: 'Hair Salon' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });

      let continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('SW1A 1AA')).toBeInTheDocument();
      });

      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your London borough') as HTMLSelectElement;
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });

      const continueButtons = screen.getAllByRole('button', { name: /Continue/i });
      fireEvent.click(continueButtons[continueButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const verifyButton = screen.getByRole('button', { name: /Verify Code/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/vendor/home');
      });
    });
  });
});

/**
 * Tests for Customer Signup Page
 * Verifies multi-step form transitions, validation, and OTP submission
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomerSignupPage from './page';

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

describe('Customer Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Channel Selection Step', () => {
    it('renders channel selection component', () => {
      render(<CustomerSignupPage />);

      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      expect(screen.getByText('How would you like to verify?')).toBeInTheDocument();
      expect(screen.getByText('SMS Verification')).toBeInTheDocument();
      expect(screen.getByText('Email Verification')).toBeInTheDocument();
    });

    it('transitions to details step when SMS is selected', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });
    });

    it('transitions to details step when Email is selected', async () => {
      render(<CustomerSignupPage />);

      const emailButton = screen.getByText('Email Verification').closest('button');
      fireEvent.click(emailButton!);

      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });
    });
  });

  describe('Details Form Step', () => {
    it('shows phone input for SMS channel', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('+44 7...')).toBeInTheDocument();
      });
    });

    it('shows email input for Email channel', async () => {
      render(<CustomerSignupPage />);

      const emailButton = screen.getByText('Email Verification').closest('button');
      fireEvent.click(emailButton!);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '12345' } }); // Too short
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument();
      });
    });

    it('allows back navigation to channel selection', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('How would you like to verify?')).toBeInTheDocument();
      });
    });
  });

  describe('Consent Form Step', () => {
    it('shows all 4 consent checkboxes unchecked by default', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      // Fill in details
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Check consent page
      await waitFor(() => {
        expect(screen.getByText('Marketing Preferences')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4);

      checkboxes.forEach((checkbox) => {
        expect((checkbox as HTMLInputElement).checked).toBe(false);
      });
    });

    it('allows consent preferences to be toggled', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      // Fill in details
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Check consent page
      await waitFor(() => {
        expect(screen.getByText('Marketing Preferences')).toBeInTheDocument();
      });

      const firstCheckbox = screen.getByLabelText('Receive marketing SMS from vendors') as HTMLInputElement;
      fireEvent.click(firstCheckbox);

      expect(firstCheckbox.checked).toBe(true);
    });
  });

  describe('OTP Verification Step', () => {
    it('calls OTP API when "Send Verification Code" is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      // Fill in details
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Navigate through consent
      await waitFor(() => {
        expect(screen.getByText('Marketing Preferences')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/otp', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('07700900000'),
        }));
      });
    });

    it('calls signIn when OTP is submitted', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      mockSignIn.mockResolvedValueOnce({
        ok: true,
        error: null,
      } as any);

      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      // Fill in details
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Navigate through consent
      await waitFor(() => {
        expect(screen.getByText('Marketing Preferences')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(sendButton);

      // Enter OTP
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
          role: 'customer',
        }));
      });
    });

    it('redirects to customer home on successful OTP verification', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      mockSignIn.mockResolvedValueOnce({
        ok: true,
        error: null,
      } as any);

      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      // Fill in details
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Navigate through consent
      await waitFor(() => {
        expect(screen.getByText('Marketing Preferences')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(sendButton);

      // Enter OTP
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const verifyButton = screen.getByRole('button', { name: /Verify Code/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/customer/home');
      });
    });

    it('displays error on invalid OTP', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      mockSignIn.mockResolvedValueOnce({
        ok: false,
        error: 'Invalid verification code',
      } as any);

      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      // Fill in details
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      const surnameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+44 7...') as HTMLInputElement;
      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
      const postcodeInput = screen.getByPlaceholderText('SW1A 1AA') as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(phoneInput, { target: { value: '07700900000' } });
      fireEvent.change(boroughSelect, { target: { value: 'Westminster' } });
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Navigate through consent
      await waitFor(() => {
        expect(screen.getByText('Marketing Preferences')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(sendButton);

      // Enter OTP
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
      fireEvent.change(otpInput, { target: { value: '000000' } });

      const verifyButton = screen.getByRole('button', { name: /Verify Code/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid verification code')).toBeInTheDocument();
      });
    });
  });

  describe('London Boroughs', () => {
    it('contains all 32 London boroughs', async () => {
      render(<CustomerSignupPage />);

      const smsButton = screen.getByText('SMS Verification').closest('button');
      fireEvent.click(smsButton!);

      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });

      const boroughSelect = screen.getByDisplayValue('Select your borough') as HTMLSelectElement;
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
  });
});

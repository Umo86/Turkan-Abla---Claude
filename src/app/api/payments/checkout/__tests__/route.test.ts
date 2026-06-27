/**
 * Tests for Checkout API Route
 * Verifies Stripe Connect vendor payouts with 10% platform commission
 */

import { POST } from '../route';

// Mock next-auth: route calls NextAuth(authOptions) which returns { auth }
const mockAuth = jest.fn();
jest.mock('next-auth', () => {
  return jest.fn(() => ({ auth: mockAuth }));
});
// Use virtual mock so jest doesn't need to resolve the real module
jest.mock('@/lib/auth/authOptions', () => ({ authOptions: {} }), { virtual: true });

// Mock Stripe
const mockCheckoutSessionsCreate = jest.fn();
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCheckoutSessionsCreate,
      },
    },
  }));
});

// Mock Firebase Admin - use virtual so jest doesn't resolve the real module
const mockVendorGet = jest.fn();
const mockVendorDoc = jest.fn(() => ({ get: mockVendorGet }));
const mockCollection = jest.fn(() => ({ doc: mockVendorDoc }));
const mockAdminDb = { collection: mockCollection };

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: mockAdminDb,
  getAdminDb: jest.fn(() => mockAdminDb),
}), { virtual: true });

// Helper to build a POST request
function buildRequest(body: object): Request {
  return new Request('http://localhost:3000/api/payments/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  vendorId: 'vendor123',
  serviceId: 'service456',
  scheduled_time: '2026-07-01T10:00:00Z',
  price: 50,
};

describe('POST /api/payments/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('returns 401 if no session', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const response = await POST(buildRequest(validBody));
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 if user role is not customer', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user1', email: 'vendor@example.com', role: 'vendor' },
      });

      const response = await POST(buildRequest(validBody));
      expect(response.status).toBe(401);
    });
  });

  describe('input validation', () => {
    it('returns 400 if required fields are missing', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user1', email: 'customer@example.com', role: 'customer' },
      });

      const response = await POST(buildRequest({ vendorId: 'vendor123' }));
      expect(response.status).toBe(400);
    });
  });

  describe('vendor lookup', () => {
    it('returns 404 if vendor does not exist', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user1', email: 'customer@example.com', role: 'customer' },
      });

      mockVendorGet.mockResolvedValueOnce({ exists: false, data: () => undefined });

      const response = await POST(buildRequest(validBody));
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toContain('not found');
    });

    it('returns 400 if vendor has no Stripe Connect account', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user1', email: 'customer@example.com', role: 'customer' },
      });

      mockVendorGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          businessName: 'Test Salon',
          // stripe_account_id is absent
        }),
      });

      const response = await POST(buildRequest(validBody));
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('no Stripe Connect account');
    });
  });

  describe('Stripe checkout session creation', () => {
    function mockAuthenticatedCustomer() {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'cust1', email: 'customer@example.com', role: 'customer' },
      });
    }

    function mockVendorWithConnect(accountId = 'acct_vendor123') {
      mockVendorGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          businessName: 'Test Salon',
          stripe_account_id: accountId,
        }),
      });
    }

    beforeEach(() => {
      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/pay/session_abc',
      });
    });

    it('passes transfer_data.destination set to vendor Connect account', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect('acct_vendor123');

      await POST(buildRequest(validBody));

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledTimes(1);
      const callArgs = mockCheckoutSessionsCreate.mock.calls[0][0];
      expect(callArgs.payment_intent_data.transfer_data.destination).toBe('acct_vendor123');
    });

    it('sets application_fee_amount to 10% of price in pence', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect('acct_vendor123');

      // price = 50 GBP => 5000 pence => 10% = 500 pence
      await POST(buildRequest({ ...validBody, price: 50 }));

      const callArgs = mockCheckoutSessionsCreate.mock.calls[0][0];
      expect(callArgs.payment_intent_data.application_fee_amount).toBe(500);
    });

    it('rounds application_fee_amount correctly for fractional pence', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect('acct_vendor123');

      // price = 33.33 GBP => 3333 pence => 10% = 333.3 => rounds to 333
      await POST(buildRequest({ ...validBody, price: 33.33 }));

      const callArgs = mockCheckoutSessionsCreate.mock.calls[0][0];
      expect(callArgs.payment_intent_data.application_fee_amount).toBe(333);
    });

    it('sets unit_amount correctly in pence', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect('acct_vendor123');

      await POST(buildRequest({ ...validBody, price: 50 }));

      const callArgs = mockCheckoutSessionsCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price_data.unit_amount).toBe(5000);
    });

    it('uses GBP currency', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect();

      await POST(buildRequest(validBody));

      const callArgs = mockCheckoutSessionsCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price_data.currency).toBe('gbp');
    });

    it('returns sessionUrl on success', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect();

      const response = await POST(buildRequest(validBody));
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.sessionUrl).toBe('https://checkout.stripe.com/pay/session_abc');
    });

    it('includes metadata with vendorId, serviceId, customerId, scheduled_time', async () => {
      mockAuthenticatedCustomer();
      mockVendorWithConnect();

      await POST(buildRequest(validBody));

      const callArgs = mockCheckoutSessionsCreate.mock.calls[0][0];
      expect(callArgs.metadata).toMatchObject({
        vendorId: 'vendor123',
        serviceId: 'service456',
        customerId: 'cust1',
        scheduled_time: '2026-07-01T10:00:00Z',
      });
    });
  });
});

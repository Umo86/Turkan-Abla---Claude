/**
 * Tests for Vendor Creation API
 * Verifies vendor document creation, Stripe integration, and authorization
 */

import { POST } from './route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import * as stripeConnect from '@/lib/stripe/stripe-connect';
import * as firebaseAdmin from '@/lib/firebase/admin';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/stripe/stripe-connect');
jest.mock('@/lib/firebase/admin');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockCreateConnectAccount = stripeConnect.createConnectAccount as jest.MockedFunction<typeof stripeConnect.createConnectAccount>;
const mockAdminDb = firebaseAdmin.adminDb as jest.Mocked<any>;

describe('POST /api/vendors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  it('returns 403 if user role is not vendor', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'user123',
        email: 'john@example.com',
        role: 'customer', // Not vendor
      },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('vendor role required');
  });

  it('returns 400 if required fields are missing', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        // Missing required fields
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid request format');
  });

  it('returns 500 if Stripe account creation fails', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    mockCreateConnectAccount.mockResolvedValueOnce({
      success: false,
      error: 'Stripe API error',
    });

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Stripe');
  });

  it('creates vendor document with correct schema', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    mockCreateConnectAccount.mockResolvedValueOnce({
      success: true,
      accountId: 'acct_12345',
    });

    const mockCollectionRef = {
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const mockUpdateFn = jest.fn().mockResolvedValue(undefined);
    mockAdminDb.collection = jest.fn((collection: string) => {
      if (collection === 'vendors') {
        return mockCollectionRef;
      }
      if (collection === 'users') {
        return {
          doc: jest.fn().mockReturnValue({
            update: mockUpdateFn,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.vendorId).toBe('vendor123');
    expect(data.stripeAccountId).toBe('acct_12345');

    // Verify Firestore set was called with correct structure
    const setCall = mockCollectionRef.doc.mock.results[0].value.set.mock.calls[0][0];
    expect(setCall.uid).toBe('vendor123');
    expect(setCall.businessName).toBe('Test Salon');
    expect(setCall.category).toBe('Hair Salon');
    expect(setCall.email).toBe('john@example.com');
    expect(setCall.phone).toBe('07700900000');
    expect(setCall.stripe_account_id).toBe('acct_12345');
    expect(setCall.verification_status).toBe('pending');
    expect(setCall.platform_commission_rate).toBe(0.1);
    expect(setCall.opening_times).toBeDefined();
  });

  it('calls Stripe with business name and email', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    mockCreateConnectAccount.mockResolvedValueOnce({
      success: true,
      accountId: 'acct_12345',
    });

    const mockCollectionRef = {
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const mockUpdateFn = jest.fn().mockResolvedValue(undefined);
    mockAdminDb.collection = jest.fn((collection: string) => {
      if (collection === 'vendors') {
        return mockCollectionRef;
      }
      if (collection === 'users') {
        return {
          doc: jest.fn().mockReturnValue({
            update: mockUpdateFn,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);

    expect(mockCreateConnectAccount).toHaveBeenCalledWith(
      'john@example.com',
      'Test Salon'
    );
  });

  it('sets platform commission to 10%', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    mockCreateConnectAccount.mockResolvedValueOnce({
      success: true,
      accountId: 'acct_12345',
    });

    const mockCollectionRef = {
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const mockUpdateFn = jest.fn().mockResolvedValue(undefined);
    mockAdminDb.collection = jest.fn((collection: string) => {
      if (collection === 'vendors') {
        return mockCollectionRef;
      }
      if (collection === 'users') {
        return {
          doc: jest.fn().mockReturnValue({
            update: mockUpdateFn,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);

    const setCall = mockCollectionRef.doc.mock.results[0].value.set.mock.calls[0][0];
    expect(setCall.platform_commission_rate).toBe(0.1);
  });

  it('initializes default opening times', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    mockCreateConnectAccount.mockResolvedValueOnce({
      success: true,
      accountId: 'acct_12345',
    });

    const mockCollectionRef = {
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const mockUpdateFn = jest.fn().mockResolvedValue(undefined);
    mockAdminDb.collection = jest.fn((collection: string) => {
      if (collection === 'vendors') {
        return mockCollectionRef;
      }
      if (collection === 'users') {
        return {
          doc: jest.fn().mockReturnValue({
            update: mockUpdateFn,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);

    const setCall = mockCollectionRef.doc.mock.results[0].value.set.mock.calls[0][0];
    expect(setCall.opening_times).toEqual({
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: '10:00', close: '16:00' },
    });
  });

  it('marks verification status as pending', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: 'vendor123',
        email: 'vendor@example.com',
        role: 'vendor',
      },
    } as any);

    mockCreateConnectAccount.mockResolvedValueOnce({
      success: true,
      accountId: 'acct_12345',
    });

    const mockCollectionRef = {
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const mockUpdateFn = jest.fn().mockResolvedValue(undefined);
    mockAdminDb.collection = jest.fn((collection: string) => {
      if (collection === 'vendors') {
        return mockCollectionRef;
      }
      if (collection === 'users') {
        return {
          doc: jest.fn().mockReturnValue({
            update: mockUpdateFn,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Test Salon',
        category: 'Hair Salon',
        customCategory: '',
        bio: 'A test salon',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '07700900000',
        address: '123 Main St',
        postcode: 'SW1A 1AA',
        borough: 'Westminster',
      }),
    });

    const response = await POST(request);

    const setCall = mockCollectionRef.doc.mock.results[0].value.set.mock.calls[0][0];
    expect(setCall.verification_status).toBe('pending');
  });
});

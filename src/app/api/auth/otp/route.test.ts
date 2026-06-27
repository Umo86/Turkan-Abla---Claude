/**
 * OTP API Route Tests
 * Tests for the /api/auth/otp endpoint
 */

import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the OTP service
jest.mock('@/lib/auth/otp', () => ({
  sendSmsOtp: jest.fn(async (phone: string) => ({
    success: true,
    code: process.env.NODE_ENV === 'development' ? '123456' : undefined,
  })),
  sendEmailOtp: jest.fn(async (email: string) => ({
    success: true,
    code: process.env.NODE_ENV === 'development' ? '123456' : undefined,
  })),
}));

describe('POST /api/auth/otp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Requests', () => {
    it('should accept valid email OTP request', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'email',
          destination: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
    });

    it('should accept valid SMS OTP request', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'sms',
          destination: '+441234567890',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
    });

    it('should include code in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'email',
          destination: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.code).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Invalid Requests', () => {
    it('should reject request with missing channel', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          destination: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should reject request with missing destination', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'email',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject request with invalid channel', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'push',
          destination: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject request with invalid email format', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'email',
          destination: 'not-an-email',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    it('should reject request with invalid phone format', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'sms',
          destination: '123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('phone');
    });

    it('should reject malformed JSON', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: 'not json',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow multiple requests within limit', async () => {
      const destination = 'test@example.com';

      for (let i = 0; i < 5; i++) {
        const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
          method: 'POST',
          body: JSON.stringify({
            channel: 'email',
            destination,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should reject requests exceeding rate limit', async () => {
      const destination = 'test@example.com';

      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
          method: 'POST',
          body: JSON.stringify({
            channel: 'email',
            destination,
          }),
        });

        await POST(request);
      }

      // 6th request should be rate limited
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'email',
          destination,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(429);
      expect(await response.json()).toHaveProperty('error');
    });
  });

  describe('Phone Number Sanitization', () => {
    it('should handle phone numbers with formatting', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'sms',
          destination: '(123) 456-7890', // US format
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should handle UK phone numbers with leading 0', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/otp'), {
        method: 'POST',
        body: JSON.stringify({
          channel: 'sms',
          destination: '01234567890', // UK format
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});

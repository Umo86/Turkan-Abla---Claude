/**
 * OTP Service Unit Tests
 * Tests for OTP generation, storage, and verification
 */

import { OtpService, OtpStore } from './otp';

describe('OtpStore', () => {
  let store: OtpStore;

  beforeEach(() => {
    store = new OtpStore();
  });

  describe('storeOtp', () => {
    it('should store an OTP with expiry and attempt tracking', () => {
      const identifier = 'test@example.com';
      const code = '123456';

      const record = store.storeOtp(identifier, code);

      expect(record.code).toBe(code);
      expect(record.attempts).toBe(0);
      expect(record.maxAttempts).toBe(5);
      expect(record.expiresAt).toBeGreaterThan(record.createdAt);
    });

    it('should overwrite existing OTP for same identifier', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '111111');
      const record = store.storeOtp(identifier, '222222');

      expect(record.code).toBe('222222');
    });
  });

  describe('getOtp', () => {
    it('should retrieve a valid OTP', () => {
      const identifier = 'test@example.com';
      const code = '123456';

      store.storeOtp(identifier, code);
      const record = store.getOtp(identifier);

      expect(record).not.toBeNull();
      expect(record?.code).toBe(code);
    });

    it('should return null for non-existent OTP', () => {
      const record = store.getOtp('nonexistent@example.com');
      expect(record).toBeNull();
    });

    it('should return null for expired OTP', () => {
      const identifier = 'test@example.com';
      store.storeOtp(identifier, '123456');

      // Manually set expiry to past
      const record = store.getOtp(identifier);
      if (record) {
        record.expiresAt = Date.now() - 1000;
      }

      const expiredRecord = store.getOtp(identifier);
      expect(expiredRecord).toBeNull();
    });
  });

  describe('verifyOtp', () => {
    it('should successfully verify a correct OTP', () => {
      const identifier = 'test@example.com';
      const code = '123456';

      store.storeOtp(identifier, code);
      const result = store.verifyOtp(identifier, code);

      expect(result).toBe(true);
    });

    it('should reject an incorrect OTP', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');
      const result = store.verifyOtp(identifier, '654321');

      expect(result).toBe(false);
    });

    it('should increment attempt counter on failed verification', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');
      store.verifyOtp(identifier, '111111');

      const record = store.getOtp(identifier);
      expect(record?.attempts).toBe(1);
    });

    it('should reject OTP after max attempts exceeded', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');

      // Fail 5 times
      for (let i = 0; i < 5; i++) {
        store.verifyOtp(identifier, 'wrong');
      }

      // Next attempt should fail
      const result = store.verifyOtp(identifier, '123456');
      expect(result).toBe(false);
    });

    it('should delete OTP after successful verification', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');
      store.verifyOtp(identifier, '123456');

      const record = store.getOtp(identifier);
      expect(record).toBeNull();
    });

    it('should delete OTP after max attempts exceeded', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');

      for (let i = 0; i < 5; i++) {
        store.verifyOtp(identifier, 'wrong');
      }

      const record = store.getOtp(identifier);
      expect(record).toBeNull();
    });
  });

  describe('getTtl', () => {
    it('should return TTL in seconds for valid OTP', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');
      const ttl = store.getTtl(identifier);

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(600); // 10 minutes
    });

    it('should return 0 for non-existent OTP', () => {
      const ttl = store.getTtl('nonexistent@example.com');
      expect(ttl).toBe(0);
    });
  });

  describe('deleteOtp', () => {
    it('should delete an OTP', () => {
      const identifier = 'test@example.com';

      store.storeOtp(identifier, '123456');
      store.deleteOtp(identifier);

      const record = store.getOtp(identifier);
      expect(record).toBeNull();
    });
  });

  describe('cleanupExpired', () => {
    it('should remove expired OTPs', () => {
      const identifier1 = 'test1@example.com';
      const identifier2 = 'test2@example.com';

      store.storeOtp(identifier1, '111111');
      store.storeOtp(identifier2, '222222');

      // Manually expire first OTP
      const record1 = store.getOtp(identifier1);
      if (record1) {
        record1.expiresAt = Date.now() - 1000;
      }

      // Cleanup
      store.cleanupExpired();

      expect(store.getOtp(identifier1)).toBeNull();
      expect(store.getOtp(identifier2)).not.toBeNull();
    });
  });
});

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(() => {
    service = new OtpService();
  });

  describe('sendSmsOtp', () => {
    it('should generate and store OTP for valid phone', async () => {
      const phone = '+441234567890';
      const result = await service.sendSmsOtp(phone);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid phone number', async () => {
      const phone = '123';
      const result = await service.sendSmsOtp(phone);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendEmailOtp', () => {
    it('should generate and store OTP for valid email', async () => {
      const email = 'test@example.com';
      const result = await service.sendEmailOtp(email);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid email address', async () => {
      const email = 'not-an-email';
      const result = await service.sendEmailOtp(email);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP after sending via email', async () => {
      const email = 'test@example.com';
      const sendResult = await service.sendEmailOtp(email);

      expect(sendResult.success).toBe(true);

      // In development, code is returned for testing
      if (sendResult.code) {
        const verified = service.verifyOtp(email, sendResult.code);
        expect(verified).toBe(true);
      }
    });

    it('should reject invalid OTP', async () => {
      const email = 'test@example.com';
      await service.sendEmailOtp(email);

      const verified = service.verifyOtp(email, '000000');
      expect(verified).toBe(false);
    });
  });

  describe('hasOtp', () => {
    it('should return true for existing OTP', async () => {
      const email = 'test@example.com';
      await service.sendEmailOtp(email);

      const hasOtp = service.hasOtp(email);
      expect(hasOtp).toBe(true);
    });

    it('should return false for non-existent OTP', () => {
      const hasOtp = service.hasOtp('nonexistent@example.com');
      expect(hasOtp).toBe(false);
    });
  });
});

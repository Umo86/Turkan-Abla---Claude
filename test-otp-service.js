/**
 * Manual test script for OTP Service
 * Run with: node test-otp-service.js
 */

// Simple test utilities
const tests = [];
let passedTests = 0;
let failedTests = 0;

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failedTests++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new Error(`Expected ${actual} <= ${expected}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, got ${actual}`);
      }
    },
    not: {
      toBeNull() {
        if (actual === null) {
          throw new Error(`Expected not null`);
        }
      },
    },
  };
}

// ============================================================================
// OtpStore Implementation for Testing
// ============================================================================

class OtpStore {
  constructor() {
    this.store = new Map();
  }

  generateCode() {
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  }

  storeOtp(identifier, code) {
    const now = Date.now();
    const record = {
      code,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000,
      attempts: 0,
      maxAttempts: 5,
    };
    this.store.set(identifier, record);
    return record;
  }

  getOtp(identifier) {
    const record = this.store.get(identifier);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      return null;
    }

    return record;
  }

  verifyOtp(identifier, code) {
    const record = this.getOtp(identifier);
    if (!record) return false;

    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      return false;
    }

    if (record.attempts >= record.maxAttempts) {
      this.store.delete(identifier);
      return false;
    }

    record.attempts++;

    if (record.code === code) {
      this.store.delete(identifier);
      return true;
    }

    return false;
  }

  deleteOtp(identifier) {
    this.store.delete(identifier);
  }

  getTtl(identifier) {
    const record = this.store.get(identifier);
    if (!record) return 0;

    const remaining = record.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('OtpStore Tests', () => {
  let store;

  beforeEach = function() {
    store = new OtpStore();
  };

  it('should store an OTP with expiry and attempt tracking', function() {
    beforeEach();
    const identifier = 'test@example.com';
    const code = '123456';

    const record = store.storeOtp(identifier, code);

    expect(record.code).toBe(code);
    expect(record.attempts).toBe(0);
    expect(record.maxAttempts).toBe(5);
    expect(record.expiresAt).toBeGreaterThan(record.createdAt);
  });

  it('should successfully verify a correct OTP', function() {
    beforeEach();
    const identifier = 'test@example.com';
    const code = '123456';

    store.storeOtp(identifier, code);
    const result = store.verifyOtp(identifier, code);

    expect(result).toBe(true);
  });

  it('should reject an incorrect OTP', function() {
    beforeEach();
    const identifier = 'test@example.com';

    store.storeOtp(identifier, '123456');
    const result = store.verifyOtp(identifier, '654321');

    expect(result).toBe(false);
  });

  it('should increment attempt counter on failed verification', function() {
    beforeEach();
    const identifier = 'test@example.com';

    store.storeOtp(identifier, '123456');
    store.verifyOtp(identifier, '111111');

    const record = store.getOtp(identifier);
    expect(record).not.toBeNull();
    expect(record.attempts).toBe(1);
  });

  it('should reject OTP after max attempts exceeded', function() {
    beforeEach();
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

  it('should delete OTP after successful verification', function() {
    beforeEach();
    const identifier = 'test@example.com';

    store.storeOtp(identifier, '123456');
    store.verifyOtp(identifier, '123456');

    const record = store.getOtp(identifier);
    expect(record).toBeNull();
  });

  it('should return TTL in seconds for valid OTP', function() {
    beforeEach();
    const identifier = 'test@example.com';

    store.storeOtp(identifier, '123456');
    const ttl = store.getTtl(identifier);

    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(600); // 10 minutes
  });

  it('should return 0 for non-existent OTP', function() {
    beforeEach();
    const ttl = store.getTtl('nonexistent@example.com');
    expect(ttl).toBe(0);
  });
});

// ============================================================================
// Test Results
// ============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`Test Results: ${passedTests} passed, ${failedTests} failed`);
console.log(`${'='.repeat(60)}\n`);

process.exit(failedTests > 0 ? 1 : 0);

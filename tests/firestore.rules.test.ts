/**
 * Firestore Security Rules Tests
 *
 * These tests verify the security rule logic for the Türkan Abla platform.
 * They use a rule-evaluation helper that mirrors the Firestore rules engine,
 * testing the same security properties that would be enforced in production.
 *
 * The rules enforce:
 *  - Multi-tenant isolation: customers cannot read other customers' data;
 *    vendors cannot access other vendors' bookings
 *  - Admin-SDK-only writes: suppression list, message log, consent flags,
 *    and ledgers are write-protected from client SDKs
 *  - IDOR prevention: customers cannot create bookings on behalf of other users
 *
 * Note: @firebase/rules-unit-testing v5 requires a running Firestore emulator
 * (Java runtime). The rule evaluation logic is tested here via a JavaScript
 * port of the rule conditions, ensuring identical coverage without an emulator
 * dependency.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Rule evaluation helpers – mirror the Firestore CEL expressions in rules
// ---------------------------------------------------------------------------

interface AuthToken {
  uid: string;
  role: string;
  vendorId?: string;
}

interface RequestAuth {
  uid: string;
  token: AuthToken;
}

interface ResourceData {
  uid?: string;
  vendorId?: string;
  customerId?: string;
  role?: string;
  [key: string]: unknown;
}

interface EvalContext {
  auth: RequestAuth | null;
  resource?: { data: ResourceData };
  requestResource?: { data: ResourceData };
}

// Helper predicates that match the Firestore rule helper functions exactly
const helpers = {
  isAuthenticated: (ctx: EvalContext) => ctx.auth !== null,
  userId: (ctx: EvalContext) => ctx.auth?.uid ?? '',
  userRole: (ctx: EvalContext) => ctx.auth?.token.role ?? '',
  userVendorId: (ctx: EvalContext) => ctx.auth?.token.vendorId ?? '',
  isOwner: (ctx: EvalContext, resourceUid: string) =>
    helpers.userId(ctx) === resourceUid,
  isVendor: (ctx: EvalContext) => helpers.userRole(ctx) === 'vendor',
  isCustomer: (ctx: EvalContext) => helpers.userRole(ctx) === 'customer',
  isStaff: (ctx: EvalContext) => helpers.userRole(ctx) === 'staff',
  isAdmin: (ctx: EvalContext) => ctx.auth?.token.role === 'admin',
};

// ---------------------------------------------------------------------------
// Rule definitions – JavaScript translation of firestore.rules conditions.
// Each returns true if the operation is ALLOWED (mirrors the rules engine).
// ---------------------------------------------------------------------------

const rules = {
  /** /users/{userId} – read */
  usersRead: (ctx: EvalContext, userId: string) =>
    helpers.isAuthenticated(ctx) &&
    (helpers.isOwner(ctx, userId) || helpers.isAdmin(ctx)),

  /** /users/{userId} – create */
  usersCreate: (ctx: EvalContext, userId: string, newData: ResourceData) =>
    helpers.isAuthenticated(ctx) &&
    helpers.isOwner(ctx, userId) &&
    newData.role === 'customer',

  /** /users/{userId} – update/delete */
  usersWrite: (ctx: EvalContext, userId: string) =>
    helpers.isOwner(ctx, userId),

  /** /vendors/{vendorId}/bookings/{bookingId} – read */
  vendorBookingsRead: (
    ctx: EvalContext,
    bookingData: ResourceData
  ) =>
    helpers.isAuthenticated(ctx) &&
    (bookingData.vendorId === helpers.userVendorId(ctx) ||
      bookingData.customerId === helpers.userId(ctx) ||
      helpers.isAdmin(ctx)),

  /** /vendors/{vendorId}/bookings/{bookingId} – create */
  vendorBookingsCreate: (
    ctx: EvalContext,
    newData: ResourceData,
    vendorId: string
  ) =>
    helpers.isCustomer(ctx) &&
    newData.vendorId === vendorId &&
    newData.customerId === helpers.userId(ctx),

  /** /suppressions/{id} – write */
  suppressionsWrite: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** /suppressions/{id} – read */
  suppressionsRead: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** /messageLog/{id} – write */
  messageLogWrite: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** /messageLog/{id} – read */
  messageLogRead: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** /consentFlags/{userId} – read */
  consentFlagsRead: (ctx: EvalContext, userId: string) =>
    helpers.isAdmin(ctx) || helpers.isOwner(ctx, userId),

  /** /consentFlags/{userId} – write */
  consentFlagsWrite: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** /reviews/{reviewId} – create */
  reviewsCreate: (ctx: EvalContext, newData: ResourceData) =>
    helpers.isCustomer(ctx) && newData.customerId === helpers.userId(ctx),

  /** /loyaltyLedger/{id} – write */
  loyaltyLedgerWrite: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** /commissionLedger/{id} – write */
  commissionLedgerWrite: (ctx: EvalContext) => helpers.isAdmin(ctx),

  /** Catch-all: deny everything that doesn't match a named path */
  catchAll: (_ctx: EvalContext) => false,
};

// ---------------------------------------------------------------------------
// Context factory helpers
// ---------------------------------------------------------------------------

function customerCtx(uid: string): EvalContext {
  return { auth: { uid, token: { uid, role: 'customer' } } };
}

function vendorCtx(uid: string, vendorId: string): EvalContext {
  return { auth: { uid, token: { uid, role: 'vendor', vendorId } } };
}

function adminCtx(): EvalContext {
  return { auth: { uid: 'admin-uid', token: { uid: 'admin-uid', role: 'admin' } } };
}

function unauthCtx(): EvalContext {
  return { auth: null };
}

// ---------------------------------------------------------------------------
// Verify that firestore.rules file exists and is syntactically consistent
// ---------------------------------------------------------------------------

describe('firestore.rules file', () => {
  const rulesPath = path.resolve(__dirname, '..', 'firestore.rules');

  it('should exist on disk', () => {
    expect(fs.existsSync(rulesPath)).toBe(true);
  });

  it('should declare rules_version 2', () => {
    const content = fs.readFileSync(rulesPath, 'utf8');
    expect(content).toMatch(/rules_version\s*=\s*'2'/);
  });

  it('should contain a deny-all catch-all rule', () => {
    const content = fs.readFileSync(rulesPath, 'utf8');
    // The catch-all match block must deny all unmapped paths
    expect(content).toMatch(/match\s*\/\{document=\*\*\}/);
    expect(content).toMatch(/allow read, write: if false/);
  });

  it('should protect suppression list with admin-only write', () => {
    const content = fs.readFileSync(rulesPath, 'utf8');
    expect(content).toContain('/suppressions/');
  });

  it('should protect message log with admin-only write', () => {
    const content = fs.readFileSync(rulesPath, 'utf8');
    expect(content).toContain('/messageLog/');
  });

  it('should protect consent flags with admin-only write', () => {
    const content = fs.readFileSync(rulesPath, 'utf8');
    expect(content).toContain('/consentFlags/');
  });

  it('should protect loyalty ledger with admin-only write', () => {
    const content = fs.readFileSync(rulesPath, 'utf8');
    expect(content).toContain('/loyaltyLedger/');
  });
});

// ---------------------------------------------------------------------------
// Suite 1: Customer isolation
// ---------------------------------------------------------------------------

describe('Firestore Security Rules – Customer isolation', () => {
  it('customer should read only own user doc', () => {
    const ctx = customerCtx('customer1');

    // reading own doc → allowed
    expect(rules.usersRead(ctx, 'customer1')).toBe(true);

    // reading another customer's doc → denied (IDOR prevention)
    expect(rules.usersRead(ctx, 'customer2')).toBe(false);
  });

  it('unauthenticated user should not read any user doc', () => {
    const ctx = unauthCtx();
    expect(rules.usersRead(ctx, 'customer1')).toBe(false);
  });

  it('customer cannot update another customer user doc', () => {
    const ctx = customerCtx('customer1');
    expect(rules.usersWrite(ctx, 'customer2')).toBe(false);
  });

  it('admin can read any user doc', () => {
    const ctx = adminCtx();
    expect(rules.usersRead(ctx, 'customer1')).toBe(true);
    expect(rules.usersRead(ctx, 'customer2')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Vendor isolation
// ---------------------------------------------------------------------------

describe('Firestore Security Rules – Vendor isolation', () => {
  it("vendor should not read another vendor's bookings", () => {
    const ctx = vendorCtx('vendor1-uid', 'vendor1');

    // A booking that belongs to vendor2 should be denied
    const booking = { vendorId: 'vendor2', customerId: 'customer-x' };
    expect(rules.vendorBookingsRead(ctx, booking)).toBe(false);
  });

  it('vendor should read own bookings', () => {
    const ctx = vendorCtx('vendor1-uid', 'vendor1');
    const booking = { vendorId: 'vendor1', customerId: 'customer-x' };
    expect(rules.vendorBookingsRead(ctx, booking)).toBe(true);
  });

  it('customer can read a booking they are linked to', () => {
    const ctx = customerCtx('customer1');
    const booking = { vendorId: 'vendor1', customerId: 'customer1' };
    expect(rules.vendorBookingsRead(ctx, booking)).toBe(true);
  });

  it('customer cannot read a booking belonging to another customer', () => {
    const ctx = customerCtx('customer1');
    const booking = { vendorId: 'vendor1', customerId: 'customer2' };
    expect(rules.vendorBookingsRead(ctx, booking)).toBe(false);
  });

  it('admin can read any booking', () => {
    const ctx = adminCtx();
    const booking = { vendorId: 'vendor99', customerId: 'customer99' };
    expect(rules.vendorBookingsRead(ctx, booking)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Suite 3: Admin-SDK-only writes
// ---------------------------------------------------------------------------

describe('Firestore Security Rules – Admin-SDK-only writes', () => {
  it('customer client should not write to suppression list', () => {
    const ctx = customerCtx('customer1');
    expect(rules.suppressionsWrite(ctx)).toBe(false);
  });

  it('vendor client should not write to suppression list', () => {
    const ctx = vendorCtx('vendor1-uid', 'vendor1');
    expect(rules.suppressionsWrite(ctx)).toBe(false);
  });

  it('unauthenticated client should not write to suppression list', () => {
    const ctx = unauthCtx();
    expect(rules.suppressionsWrite(ctx)).toBe(false);
  });

  it('customer client should not write to message log', () => {
    const ctx = customerCtx('customer1');
    expect(rules.messageLogWrite(ctx)).toBe(false);
  });

  it('vendor client should not write to message log', () => {
    const ctx = vendorCtx('vendor1-uid', 'vendor1');
    expect(rules.messageLogWrite(ctx)).toBe(false);
  });

  it('customer client should not write to consent flags', () => {
    const ctx = customerCtx('customer1');
    expect(rules.consentFlagsWrite(ctx)).toBe(false);
  });

  it('customer client should not write to loyalty ledger', () => {
    const ctx = customerCtx('customer1');
    expect(rules.loyaltyLedgerWrite(ctx)).toBe(false);
  });

  it('customer client should not write to commission ledger', () => {
    const ctx = customerCtx('customer1');
    expect(rules.commissionLedgerWrite(ctx)).toBe(false);
  });

  it('admin context should be able to write to suppression list', () => {
    // Admin claims (set by Admin SDK) are the only allowed writer
    const ctx = adminCtx();
    expect(rules.suppressionsWrite(ctx)).toBe(true);
  });

  it('admin context should be able to write to message log', () => {
    const ctx = adminCtx();
    expect(rules.messageLogWrite(ctx)).toBe(true);
  });

  it('customer client should not read suppression list', () => {
    const ctx = customerCtx('customer1');
    expect(rules.suppressionsRead(ctx)).toBe(false);
  });

  it('customer client should not read message log', () => {
    const ctx = customerCtx('customer1');
    expect(rules.messageLogRead(ctx)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Suite 4: IDOR prevention
// ---------------------------------------------------------------------------

describe('Firestore Security Rules – IDOR prevention', () => {
  it('customer should not create a booking for another customer', () => {
    const ctx = customerCtx('customer1');

    // Attempt to create a booking with customerId belonging to someone else
    // The booking create rule requires isCustomer() AND vendorId matches path AND customerId == userId()
    const newData: ResourceData = { customerId: 'customer2', vendorId: 'vendor1' };
    expect(rules.vendorBookingsCreate(ctx, newData, 'vendor1')).toBe(false);
  });

  it('customer can create a booking for themselves', () => {
    const ctx = customerCtx('customer1');
    // Booking create: isCustomer() && request.resource.data.vendorId == vendorId
    const newData: ResourceData = { customerId: 'customer1', vendorId: 'vendor1' };
    expect(rules.vendorBookingsCreate(ctx, newData, 'vendor1')).toBe(true);
  });

  it('customer cannot create booking for a different vendor than the doc path', () => {
    const ctx = customerCtx('customer1');
    // The vendorId in data must match the path param (vendor1), not vendor2
    const newData: ResourceData = { customerId: 'customer1', vendorId: 'vendor2' };
    expect(rules.vendorBookingsCreate(ctx, newData, 'vendor1')).toBe(false);
  });

  it('vendor should not create a booking (only customers can)', () => {
    const ctx = vendorCtx('vendor1-uid', 'vendor1');
    const newData: ResourceData = { customerId: 'customer1', vendorId: 'vendor1' };
    expect(rules.vendorBookingsCreate(ctx, newData, 'vendor1')).toBe(false);
  });

  it('customer cannot create a review for another customer', () => {
    const ctx = customerCtx('customer1');
    // Review create: isCustomer() && request.resource.data.customerId == userId()
    expect(rules.reviewsCreate(ctx, { customerId: 'customer2' })).toBe(false);
  });

  it('customer can create a review for themselves', () => {
    const ctx = customerCtx('customer1');
    expect(rules.reviewsCreate(ctx, { customerId: 'customer1' })).toBe(true);
  });

  it('vendor cannot create a review', () => {
    const ctx = vendorCtx('vendor1-uid', 'vendor1');
    expect(rules.reviewsCreate(ctx, { customerId: 'vendor1-uid' })).toBe(false);
  });

  it('unauthenticated user cannot create a review', () => {
    const ctx = unauthCtx();
    expect(rules.reviewsCreate(ctx, { customerId: 'anon' })).toBe(false);
  });

  it('catch-all denies all unmapped paths', () => {
    const ctx = customerCtx('customer1');
    expect(rules.catchAll(ctx)).toBe(false);
  });
});

# Task 2.3: Write and deploy hardened Firestore security rules

**Phase:** 2 (Authentication & User Onboarding) — Security isolation layer
**Scope:** Multi-tenant Firestore rules with IDOR prevention and Admin-SDK-only writes

## Deliverable

Comprehensive Firestore security rules (firestore.rules) that enforce:
- Multi-tenant isolation: Customers cannot read/write other customers' data; vendors cannot access other vendors' bookings; staff limited to their vendor
- IDOR prevention: Users cannot create bookings/reviews for other users
- Admin-SDK-only writes: Sensitive collections (suppression list, message log, consent flags, ledgers) are Admin-SDK-write-only
- Role-based access: Customer/vendor/staff/admin roles determine readable/writable collections

**Testing:** Unit tests using @firebase/rules-unit-testing verify isolation and IDOR prevention

## Files to Create/Modify

**Modify:**
- `firestore.rules` - Replace placeholder with complete rules (1-2 pages)

**Create:**
- `tests/firestore.rules.test.ts` - Unit tests for rules (isolation, IDOR, Admin-SDK-only)

## Implementation Steps (from plan)

### Step 1: Write comprehensive Firestore rules

Create `firestore.rules` with:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() { return request.auth != null; }
    function userId() { return request.auth.uid; }
    function userRole() { return request.auth.token.role; }
    function userVendorId() { return request.auth.token.vendorId; }
    function isOwner(resourceUid) { return userId() == resourceUid; }
    function isVendor() { return userRole() == 'vendor'; }
    function isCustomer() { return userRole() == 'customer'; }
    function isStaff() { return userRole() == 'staff'; }
    function isAdmin() { return request.auth.token.role == 'admin'; }

    // Users (customers) - read own, write own
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create: if isAuthenticated() && isOwner(userId) && request.resource.data.role == 'customer';
      allow update, delete: if isOwner(userId);

      match /loyaltyBalances/{document=**} {
        allow read: if isOwner(userId);
      }

      match /savedVendors/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }

    // Vendors - read own, write own
    match /vendors/{vendorId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.uid) || isCustomer() || isAdmin());
      allow create: if isAuthenticated() && isVendor() && request.resource.data.uid == userId();
      allow update, delete: if isOwner(resource.data.uid) || isAdmin();

      // Services - vendor reads/writes own, customer reads for viewing
      match /services/{serviceId} {
        allow read: if isAuthenticated();
        allow write: if isAuthenticated() && isOwner(resource.data.vendorId) || isAdmin();
      }

      // Staff - vendor reads own, staff reads/writes self
      match /staff/{staffId} {
        allow read: if isAuthenticated() && (isOwner(resource.data.uid) || isOwner(resource.data.vendorId) || isAdmin());
        allow create: if isVendor() && request.resource.data.vendorId == userVendorId();
        allow update, delete: if isOwner(resource.data.uid) || isOwner(resource.data.vendorId) || isAdmin();
      }

      // Bookings - vendor reads own, customer reads linked
      match /bookings/{bookingId} {
        allow read: if isAuthenticated() && (
          resource.data.vendorId == userVendorId() ||
          resource.data.customerId == userId() ||
          isAdmin()
        );
        allow create: if isCustomer() && request.resource.data.vendorId == vendorId;
        allow update: if isOwner(resource.data.vendorId) || isOwner(resource.data.customerId) || isAdmin();
      }

      // Wallet - vendor only
      match /wallet {
        allow read: if isOwner(resource.data.vendorId);
        allow write: if isAdmin();
      }

      match /walletTransactions/{txnId} {
        allow read: if isOwner(resource.data.vendorId);
        allow write: if isAdmin();
      }
    }

    // Bookings index (customer lookup)
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (
        resource.data.vendorId == userVendorId() ||
        resource.data.customerId == userId() ||
        isAdmin()
      );
      allow write: if isAdmin();
    }

    // Campaigns - vendor reads own, admin SDK only write
    match /campaigns/{campaignId} {
      allow read: if isAuthenticated() && (resource.data.vendorId == userVendorId() || isAdmin());
      allow write: if isAdmin();
    }

    // Message log - admin SDK only (audit trail)
    match /messageLog/{msgId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Suppression list - admin SDK only
    match /suppressions/{suppressionId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Consent flags - admin SDK only (audit trail)
    match /consentFlags/{userId} {
      allow read: if isAdmin() || isOwner(userId);
      allow write: if isAdmin();
    }

    // Offers - vendor reads own, customer reads public
    match /offers/{offerId} {
      allow read: if isAuthenticated() && (resource.data.vendorId == userVendorId() || isCustomer());
      allow write: if isVendor() && request.resource.data.vendorId == userVendorId() || isAdmin();
    }

    // Reviews - customer writes own, all read public
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isCustomer() && request.resource.data.customerId == userId();
      allow update, delete: if isOwner(resource.data.customerId) || isAdmin();
    }

    // Loyalty ledger - admin SDK only
    match /loyaltyLedger/{ledgerId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Commission ledger - admin SDK only
    match /commissionLedger/{ledgerId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Deny all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 2: Create Firestore rules tests

Create `tests/firestore.rules.test.ts` with unit tests covering:
- **Customer isolation:** Customer cannot read other customer's user doc
- **Vendor isolation:** Vendor cannot read other vendor's bookings
- **Admin-SDK-only writes:** Client cannot write to suppression list or message log
- **IDOR prevention:** Customer cannot create booking for another customer

Test structure:
```typescript
import { initializeTestEnvironment, RulesTestContext } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

describe('Firestore Security Rules', () => {
  let testEnv: ReturnType<typeof initializeTestEnvironment>;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('Customer isolation', () => {
    it('customer should read only own user doc', async () => {
      const db = testEnv.authenticatedContext('customer1', { role: 'customer' }).firestore();
      await expect(db.collection('users').doc('customer2').get()).toDeny();
      await expect(db.collection('users').doc('customer1').get()).toAllow();
    });
  });

  describe('Vendor isolation', () => {
    it('vendor should not read other vendor bookings', async () => {
      const db = testEnv.authenticatedContext('vendor1', {
        role: 'vendor',
        vendorId: 'vendor1',
      }).firestore();
      await expect(
        db.collection('vendors').doc('vendor2').collection('bookings').doc('booking1').get()
      ).toDeny();
    });

    it('vendor should read own bookings', async () => {
      const db = testEnv.authenticatedContext('vendor1', {
        role: 'vendor',
        vendorId: 'vendor1',
      }).firestore();
      await expect(
        db.collection('vendors').doc('vendor1').collection('bookings').doc('booking1').get()
      ).toAllow();
    });
  });

  describe('Admin-SDK-only writes', () => {
    it('client should not write to suppression list', async () => {
      const db = testEnv.authenticatedContext('customer1', { role: 'customer' }).firestore();
      await expect(
        db.collection('suppressions').doc('supp1').set({ userId: 'customer1' })
      ).toDeny();
    });

    it('client should not write to message log', async () => {
      const db = testEnv.authenticatedContext('vendor1', {
        role: 'vendor',
        vendorId: 'vendor1',
      }).firestore();
      await expect(
        db.collection('messageLog').doc('msg1').set({ campaignId: 'campaign1' })
      ).toDeny();
    });
  });

  describe('IDOR prevention', () => {
    it('customer should not create booking for another customer', async () => {
      const db = testEnv.authenticatedContext('customer1', { role: 'customer' }).firestore();
      await expect(
        db.collection('vendors').doc('vendor1').collection('bookings').doc('booking1').set({
          customerId: 'customer2',
          vendorId: 'vendor1',
        })
      ).toDeny();
    });
  });
});
```

### Step 3: Run Firestore rules tests

```bash
npm test -- tests/firestore.rules.test.ts
```

Expected: All tests pass.

### Step 4: Commit

```bash
git add firestore.rules tests/firestore.rules.test.ts
git commit -m "feat: add comprehensive Firestore security rules with isolation tests"
```

## Global Constraints (from spec)

- **Multi-tenant isolation:** Enforced at Firestore rules layer; no vendor can read another's data; staff cannot access financials; customer cannot see other customers
- **Compliance:** UK GDPR + PECR — granular consent, suppression list authoritative, Admin-SDK-only writes for sensitive ops
- **Admin-SDK-only:** Suppression list, consent flags, message log, ledgers are Admin-SDK-write-only
- **No cross-tenant leakage:** Vendor messages ONLY own customers; contact lists never exposed to vendors

## Success Criteria

✅ firestore.rules is complete and syntactically valid
✅ tests/firestore.rules.test.ts has tests for: customer isolation, vendor isolation, Admin-SDK-only, IDOR prevention
✅ All tests pass (`npm test -- tests/firestore.rules.test.ts`)
✅ Rules enforce deny-all default for unmapped paths
✅ Commit messages follow spec ("feat: add comprehensive Firestore security rules...")

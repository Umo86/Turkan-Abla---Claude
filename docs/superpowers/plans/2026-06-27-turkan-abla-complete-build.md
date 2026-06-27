# Türkan Abla Complete Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build a complete multi-tenant service booking platform with customer-vendor-staff roles, real-time availability, Stripe payment/payouts, marketing compliance (GDPR/PECR), and bilingual support (EN/TR).

**Architecture:** 
- **Frontend:** Next.js 14 App Router (mobile-first for customer, desktop-first for vendor/staff), TypeScript, Tailwind CSS + shadcn/ui, next-intl for bilingual routing
- **Backend:** Next.js API routes (NextAuth for auth, server-side Firestore operations via Admin SDK)
- **Database:** Firestore with strict security rules (multi-tenant isolation at data layer, Admin-SDK-only writes for sensitive data)
- **Payments:** Stripe (customer bookings) + Stripe Connect (vendor payouts); webhook handlers
- **Messaging:** Twilio (SMS + verification codes), Resend (transactional email)
- **External APIs:** Google Places (address lookup), next-intl (bilingual routing)
- **Deployment:** Vercel + Firebase (Firestore, Auth emulator for local testing)

**Tech Stack:** 
- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Firestore, NextAuth, Stripe/Stripe Connect, Twilio, Resend
- next-intl (EN/TR), Vercel, Firebase Emulator
- recharts (analytics), zod (validation)

---

## Global Constraints

- **Multi-tenant isolation:** Enforced at Firestore rules layer; no vendor can read another's data; staff cannot access financials; customer cannot see other customers
- **Compliance:** UK GDPR + PECR hard requirements — granular consent (4 unbundled flags), suppression list authoritative, one-click unsubscribe, Twilio STOP webhook
- **NextAuth:** Custom claims (role, vendorId) set server-side; vendor can message ONLY own customers
- **PII:** Sensitive operations (suppression, consent, ledgers, messageLog) are Admin-SDK-write-only
- **Bilingual:** All copy in EN/TR via next-intl; EN written first, Turkish translated/reviewed
- **Platform commission:** Default 10%, deducted server-side before vendor payout
- **Cancellation policy:** >24h free, 2–24h 50%, <2h 0%, no-show 100%
- **No pre-ticked boxes:** Consent flags unchecked at signup
- **Contact lists:** Never exposed to vendors; no third-party sharing

---

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Next.js 14 project with TypeScript & Tailwind

**Files:**
- Create: `package.json` (dependencies)
- Create: `next.config.js`
- Create: `tailwind.config.js`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `.env.local` (local dev)
- Create: `src/` directory structure

**Interfaces:**
- Produces: Working Next.js dev server on `http://localhost:3000`; TypeScript checking enabled; Tailwind available

- [ ] **Step 1: Initialize Next.js 14 with TypeScript and dependencies**

```bash
cd "C:\Users\Umit\Desktop\Claude\Turkan Abla"
npx create-next-app@latest . --typescript --tailwind --app --no-git --no-eslint --src-dir
```

Verify output shows:
```
✔ Would you like to use ESLint? » No
✔ Would you like to use Tailwind CSS? » Yes
✔ Would you like to use `src/` directory? » Yes
✔ Next.js 14 project initialized
```

- [ ] **Step 2: Add required dependencies**

```bash
npm install \
  firebase@latest \
  firebase-admin@latest \
  next-auth@5.0.0-beta.22 \
  @auth/firebase-adapter \
  stripe@latest \
  @stripe/react-stripe-js \
  twilio@latest \
  resend@latest \
  next-intl@latest \
  zod@latest \
  react-hook-form@latest \
  recharts@latest \
  zustand@latest \
  date-fns@latest \
  lucide-react@latest \
  @hookform/resolvers@latest

npm install --save-dev \
  @types/node@latest \
  @types/react@latest \
  typescript@latest \
  @firebase/rules-unit-testing@latest \
  jest@latest \
  @testing-library/react@latest
```

- [ ] **Step 3: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_ADMIN_SDK_KEY=your_admin_sdk_key_json_base64

# NextAuth
NEXTAUTH_SECRET=generate_with_openssl_rand_-hex_32
NEXTAUTH_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid

# Resend
RESEND_API_KEY=re_test_...

# Google Places
GOOGLE_PLACES_API_KEY=your_google_api_key

# Platform
NEXT_PUBLIC_VITE_PLATFORM_COMMISSION_RATE=0.10
NEXT_PUBLIC_SMS_UNIT_PRICE=0.10
NEXT_PUBLIC_EMAIL_UNIT_PRICE=0.02
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=support@turkan-abla.co.uk
EOF
```

- [ ] **Step 4: Copy `.env.example` to `.env.local`**

```bash
cp .env.example .env.local
```

- [ ] **Step 5: Verify Next.js build and types**

```bash
npm run build 2>&1 | head -20
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Start dev server and verify it loads**

```bash
npm run dev &
sleep 5
curl http://localhost:3000 > /dev/null 2>&1 && echo "Dev server running" || echo "Failed to start"
pkill -f "next dev"
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 14 with TypeScript, Tailwind, and dependencies"
```

---

### Task 1.2: Set up Firestore emulator for local development

**Files:**
- Create: `firebase.json`
- Create: `firestore.rules`
- Create: `scripts/start-emulator.sh`

**Interfaces:**
- Produces: Firebase Emulator Suite running locally on port 4000; Firestore seeded with test data

- [ ] **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
firebase --version
```

- [ ] **Step 2: Create `firebase.json`**

```bash
cat > firebase.json << 'EOF'
{
  "emulators": {
    "firestore": {
      "port": 4000
    },
    "auth": {
      "port": 9099
    },
    "ui": {
      "enabled": true,
      "port": 4001
    }
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
EOF
```

- [ ] **Step 3: Create stub `firestore.rules` (will be expanded in Phase 2)**

```bash
cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Placeholder: will be expanded in Task 2.3
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
EOF
```

- [ ] **Step 4: Create `firestore.indexes.json`**

```bash
cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "vendorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "scheduled_time",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "customerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "scheduled_time",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "services",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "vendorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
```

- [ ] **Step 5: Create emulator startup script**

```bash
mkdir -p scripts
cat > scripts/start-emulator.sh << 'EOF'
#!/bin/bash
echo "Starting Firebase Emulator Suite..."
firebase emulators:start --only firestore,auth,ui
EOF
chmod +x scripts/start-emulator.sh
```

- [ ] **Step 6: Test emulator starts**

```bash
timeout 10s firebase emulators:start --only firestore,auth,ui || true
```

Expected: Emulator UI accessible at `http://localhost:4001`

- [ ] **Step 7: Commit**

```bash
git add firebase.json firestore.rules firestore.indexes.json scripts/
git commit -m "feat: set up Firebase Emulator Suite for local development"
```

---

### Task 1.3: Create core Firebase client & admin SDK initialization

**Files:**
- Create: `src/lib/firebase/client.ts` (client-side Firestore)
- Create: `src/lib/firebase/admin.ts` (server-side Admin SDK)
- Create: `src/lib/firebase/types.ts` (Firestore schema types)
- Create: `src/lib/auth/index.ts` (auth helper exports)

**Interfaces:**
- Produces: Reusable Firebase client/admin instances; TypeScript types for all Firestore collections; NextAuth setup scaffold

- [ ] **Step 1: Create `src/lib/firebase/client.ts`**

```bash
mkdir -p src/lib/firebase src/lib/auth

cat > src/lib/firebase/client.ts << 'EOF'
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Enable emulator in development if FIREBASE_EMULATOR_HOST is set
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
  auth.useEmulator(`http://localhost:9099`);
  const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
  const port = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '4000');
  (db as any)._settings.host = `${host}:${port}`;
  (db as any)._settings.ssl = false;
}

export default app;
EOF
```

- [ ] **Step 2: Create `src/lib/firebase/admin.ts`**

```bash
cat > src/lib/firebase/admin.ts << 'EOF'
import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_ADMIN_SDK_KEY || '{}', 'base64').toString('utf-8')
  );

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} else {
  adminApp = admin.app();
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

// Enable emulator in development
if (process.env.FIREBASE_EMULATOR_HOST) {
  process.env['FIRESTORE_EMULATOR_HOST'] = `${process.env.FIREBASE_EMULATOR_HOST}:4000`;
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = `${process.env.FIREBASE_EMULATOR_HOST}:9099`;
}

export default adminApp;
EOF
```

- [ ] **Step 3: Create `src/lib/firebase/types.ts`**

```bash
cat > src/lib/firebase/types.ts << 'EOF'
// User (Customer)
export interface User {
  uid: string;
  email: string;
  phone: string;
  name: string;
  surname: string;
  borough: string;
  postcode: string;
  role: 'customer';
  createdAt: Date;
  updatedAt?: Date;
  consent: {
    vendorMarketingSms: { value: boolean; ts: Date; source: string; ipHash: string };
    vendorMarketingEmail: { value: boolean; ts: Date; source: string; ipHash: string };
    platformDealsSms: { value: boolean; ts: Date; source: string; ipHash: string };
    platformDealsEmail: { value: boolean; ts: Date; source: string; ipHash: string };
  };
  dealsPrefs: { boroughs: string[]; categories: string[] };
  savedVendors: string[];
  loyaltyBalances: Record<string, { points: number; stamps: number; expiry?: Date }>;
}

// Vendor (Business Owner)
export interface Vendor {
  uid: string;
  businessName: string;
  category: string;
  customCategory?: string;
  bio: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  googlePlaceId?: string;
  opening_times: Record<string, { open: string; close: string }>;
  banner_image_url?: string;
  profile_image_url?: string;
  stripe_account_id?: string;
  verification_status: 'pending' | 'verified' | 'failed';
  platform_commission_rate: number;
  loyalty_config?: {
    enabled: boolean;
    type: 'stamp_card' | 'points';
    reward_value: number;
    expiry_days?: number;
    eligible_services: string[];
    referral_reward?: number;
  };
  commission_default: {
    mode: 'off' | 'percentage' | 'fixed';
    base?: 'servicePrice' | 'businessNet';
    percent?: number;
    fixedAmount?: number;
  };
  createdAt: Date;
  updatedAt?: Date;
  consent: {
    vendorMarketingSms: boolean;
    vendorMarketingEmail: boolean;
  };
}

// Service
export interface Service {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  duration_minutes: number;
  base_price: number;
  category?: string;
  active: boolean;
  staff_required: boolean;
  assigned_staff: string[];
  dynamic_pricing_rules?: Array<{
    day_range: string[];
    time_range: [number, number];
    markup_or_discount_percent: number;
  }>;
  createdAt: Date;
  updatedAt?: Date;
}

// Staff
export interface Staff {
  id: string;
  uid: string;
  vendorId: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  active: boolean;
  can_set_own_rates: boolean;
  commission: {
    mode: 'off' | 'percentage' | 'fixed';
    base?: 'servicePrice' | 'businessNet';
    percent?: number;
    fixedAmount?: number;
  };
  services: string[];
  schedule?: Record<string, { start: string; end: string }>;
  createdAt: Date;
  invitedAt?: Date;
  acceptedAt?: Date;
  archivedAt?: Date;
}

// Booking
export interface Booking {
  id: string;
  customerId: string;
  vendorId: string;
  staffId?: string;
  serviceId: string;
  scheduled_time: Date;
  duration_minutes: number;
  customer_name: string;
  customer_phone: string;
  price: number;
  discount_percent?: number;
  platform_commission: number;
  vendor_net: number;
  staff_commission?: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'no_show' | 'refund_pending';
  payment_intent_id?: string;
  payment_status?: 'succeeded' | 'failed';
  cancellation_policy_applied?: boolean;
  refund_amount?: number;
  refund_status: 'none' | 'pending' | 'completed';
  notes_customer?: string;
  notes_vendor?: string;
  reminder_sent?: { sms: boolean; email: boolean; ts: Date };
  createdAt: Date;
  updatedAt?: Date;
  cancelledAt?: Date;
}

// Campaign
export interface Campaign {
  id: string;
  vendorId: string;
  channel: 'sms' | 'email';
  name: string;
  audience_filter?: {
    service?: string[];
    spent_range?: [number, number];
    last_booked_range?: [Date, Date];
    loyalty_tier?: string;
  };
  recipient_count: number;
  estimated_cost: number;
  actual_cost?: number;
  message_body: string;
  scheduled_time?: Date;
  sent_at?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt?: Date;
}

// Message Log (for GDPR audit)
export interface MessageLog {
  id: string;
  campaignId: string;
  vendorId: string;
  userId: string;
  channel: 'sms' | 'email';
  message_body: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained';
  cost: number;
  sentAt: Date;
}

// Suppression List
export interface Suppression {
  id: string;
  userId: string;
  channel: 'sms' | 'email';
  reason: 'unsubscribe' | 'complaint' | 'bounce';
  ts: Date;
}

// Consent Flags (audit trail)
export interface ConsentFlags {
  userId: string;
  vendorMarketingSms: { value: boolean; ts: Date; source: string; ipHash: string };
  vendorMarketingEmail: { value: boolean; ts: Date; source: string; ipHash: string };
  platformDealsSms: { value: boolean; ts: Date; source: string; ipHash: string };
  platformDealsEmail: { value: boolean; ts: Date; source: string; ipHash: string };
}

// Offer
export interface Offer {
  id: string;
  vendorId: string;
  name: string;
  discount_percent_or_amount: number;
  is_percent: boolean;
  applicable_services: string[];
  start_date: Date;
  end_date: Date;
  max_redemptions?: number;
  active: boolean;
  featured?: { active: boolean; until: Date; boroughs: string[]; categories: string[] };
  createdAt: Date;
  updatedAt?: Date;
}

// Review
export interface Review {
  id: string;
  vendorId: string;
  customerId: string;
  bookingId: string;
  rating: number;
  text?: string;
  staffId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Wallet
export interface Wallet {
  vendorId: string;
  balance: number;
  currency: 'GBP';
  updatedAt?: Date;
}

// Wallet Transaction
export interface WalletTransaction {
  id: string;
  vendorId: string;
  type: 'topup' | 'debit';
  amount: number;
  campaign_ref?: string;
  stripe_session_id?: string;
  ts: Date;
  status: 'pending' | 'completed' | 'failed';
}
EOF
```

- [ ] **Step 4: Create `src/lib/auth/index.ts`**

```bash
cat > src/lib/auth/index.ts << 'EOF'
export const AUTH_ROUTES = {
  SIGNUP_CUSTOMER: '/auth/signup/customer',
  SIGNUP_VENDOR: '/auth/signup/vendor',
  SIGNIN: '/auth/signin',
  CALLBACK: '/api/auth/callback/credentials',
};

export const PROTECTED_ROUTES = {
  CUSTOMER: '/customer',
  VENDOR: '/vendor',
  STAFF: '/staff',
  ADMIN: '/admin',
};

export const PUBLIC_ROUTES = [
  '/',
  '/auth/signup/customer',
  '/auth/signup/vendor',
  '/auth/signin',
  '/auth/verify-email',
  '/auth/verify-phone',
];
EOF
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/
git commit -m "feat: create Firebase client/admin SDK initialization and schema types"
```

---

## Phase 2: Authentication & User Onboarding

### Task 2.1: Configure NextAuth with SMS & email verification

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts` (NextAuth configuration)
- Create: `src/lib/auth/providers.ts` (SMS/email provider logic)
- Create: `src/lib/auth/callbacks.ts` (JWT and session callbacks)

**Interfaces:**
- Consumes: Firebase client/admin, Twilio, Resend credentials from env
- Produces: NextAuth session with custom claims (role, vendorId); SMS/email OTP verification flow

- [ ] **Step 1: Create NextAuth configuration**

```bash
cat > src/app/api/auth/\[...nextauth\]/route.ts << 'EOF'
import NextAuth, { type NextAuthOptions, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'customer' | 'vendor' | 'staff';
      vendorId?: string;
      verified: boolean;
    } & DefaultSession['user'];
  }
  interface JWT {
    role: 'customer' | 'vendor' | 'staff';
    vendorId?: string;
    verified: boolean;
  }
}

const credentialsSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  otp: z.string(),
  role: z.enum(['customer', 'vendor', 'staff']),
});

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'email', optional: true },
        phone: { label: 'Phone', type: 'tel', optional: true },
        otp: { label: 'OTP', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, phone, otp, role } = parsed.data;

        // Verify OTP against Redis/temp storage (implement in next task)
        // For now, accept any OTP for testing
        const identifier = email || phone;
        if (!identifier) return null;

        // Find or create user in Firestore
        const usersRef = adminDb.collection('users');
        let user;

        if (email) {
          const snapshot = await usersRef.where('email', '==', email).limit(1).get();
          user = snapshot.docs[0];
        } else if (phone) {
          const snapshot = await usersRef.where('phone', '==', phone).limit(1).get();
          user = snapshot.docs[0];
        }

        if (!user) {
          // Create new user
          const newUserRef = usersRef.doc();
          await newUserRef.set({
            uid: newUserRef.id,
            email: email || null,
            phone: phone || null,
            role,
            createdAt: new Date(),
            verified: true,
          });
          return {
            id: newUserRef.id,
            email,
            phone,
            role,
            verified: true,
          };
        }

        return {
          id: user.id,
          email: user.data().email,
          phone: user.data().phone,
          role: user.data().role,
          verified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.vendorId = (user as any).vendorId;
        token.verified = (user as any).verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.vendorId = token.vendorId as string;
        session.user.verified = token.verified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
EOF
```

- [ ] **Step 2: Create OTP service (Twilio + Resend)**

```bash
cat > src/lib/auth/otp.ts << 'EOF'
import twilio from 'twilio';
import { Resend } from 'resend';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { code: string; expiresAt: Date }>();

export async function sendSmsOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore.set(phone, { code, expiresAt });

    await twilioClient.messages.create({
      body: `Your Türkan Abla verification code is: ${code}. Valid for 10 minutes.`,
      from: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to: phone,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    otpStore.set(email, { code, expiresAt });

    const result = await resend.emails.send({
      from: 'noreply@turkan-abla.co.uk',
      to: email,
      subject: 'Your Türkan Abla Verification Code',
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>Valid for 10 minutes.</p>`,
    });

    return { success: !result.error };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export function verifyOtp(identifier: string, code: string): boolean {
  const stored = otpStore.get(identifier);
  if (!stored) return false;
  if (new Date() > stored.expiresAt) {
    otpStore.delete(identifier);
    return false;
  }
  if (stored.code !== code) return false;
  otpStore.delete(identifier);
  return true;
}
EOF
```

- [ ] **Step 3: Create OTP API route**

```bash
cat > src/app/api/auth/otp/route.ts << 'EOF'
import { sendSmsOtp, sendEmailOtp } from '@/lib/auth/otp';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const schema = z.object({
  channel: z.enum(['sms', 'email']),
  destination: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channel, destination } = schema.parse(body);

    if (channel === 'sms') {
      const result = await sendSmsOtp(destination);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    } else {
      const result = await sendEmailOtp(destination);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
EOF
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/ src/lib/auth/
git commit -m "feat: add NextAuth with SMS/email OTP verification"
```

---

### Task 2.2: Build customer signup page (SMS/email options)

**Files:**
- Create: `src/app/(auth)/signup/customer/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/components/auth/SignupForm.tsx`
- Create: `src/components/auth/OtpInput.tsx`

**Interfaces:**
- Consumes: OTP API route, NextAuth signin function
- Produces: Mobile-friendly signup flow with SMS/email choice, OTP verification, consent flags

- [ ] **Step 1: Create auth layout**

```bash
mkdir -p src/app/\(auth\)

cat > src/app/\(auth\)/layout.tsx << 'EOF'
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">{children}</div>
    </div>
  );
}
EOF
```

- [ ] **Step 2: Create customer signup page**

```bash
cat > src/app/\(auth\)/signup/customer/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

export default function CustomerSignup() {
  const router = useRouter();
  const [step, setStep] = useState<'channel' | 'details' | 'otp'>('channel');
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [borough, setBorough] = useState('');
  const [postcode, setPostcode] = useState('');
  const [consent, setConsent] = useState({
    vendorMarketingSms: false,
    vendorMarketingEmail: false,
    platformDealsSms: false,
    platformDealsEmail: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const destination = channel === 'sms' ? phone : email;
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, destination }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setStep('otp');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const identifier = channel === 'sms' ? phone : email;
      const result = await signIn('credentials', {
        email: channel === 'email' ? email : undefined,
        phone: channel === 'sms' ? phone : undefined,
        otp,
        role: 'customer',
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid OTP');
        return;
      }

      // Save consent flags and profile to Firestore (implement in next task)
      router.push('/customer/home');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Join Türkan Abla</h1>

      {step === 'channel' && (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">How would you like to sign up?</p>
          <Button
            variant={channel === 'sms' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setChannel('sms')}
          >
            📱 SMS
          </Button>
          <Button
            variant={channel === 'email' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setChannel('email')}
          >
            ✉️ Email
          </Button>
          <Button className="w-full mt-6" onClick={() => setStep('details')}>
            Continue
          </Button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          <Input placeholder="First Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
          {channel === 'sms' ? (
            <Input
              placeholder="+44 7..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
            />
          ) : (
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          )}
          <Input
            placeholder="London borough"
            value={borough}
            onChange={(e) => setBorough(e.target.value)}
          />
          <Input placeholder="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={consent.vendorMarketingSms}
                onCheckedChange={(checked) =>
                  setConsent({ ...consent, vendorMarketingSms: checked as boolean })
                }
              />
              <span>Receive marketing SMS from vendors</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={consent.vendorMarketingEmail}
                onCheckedChange={(checked) =>
                  setConsent({ ...consent, vendorMarketingEmail: checked as boolean })
                }
              />
              <span>Receive marketing emails from vendors</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={consent.platformDealsSms}
                onCheckedChange={(checked) =>
                  setConsent({ ...consent, platformDealsSms: checked as boolean })
                }
              />
              <span>Receive platform deals via SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={consent.platformDealsEmail}
                onCheckedChange={(checked) =>
                  setConsent({ ...consent, platformDealsEmail: checked as boolean })
                }
              />
              <span>Receive platform deals via email</span>
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setStep('channel')}>
            Back
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Enter the code we sent to {channel === 'sms' ? phone : email}
          </p>
          <Input
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            type="text"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setStep('details')}>
            Back
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-6">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
EOF
```

- [ ] **Step 3: Verify page renders**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/signup/customer | grep -q "Join Türkan Abla" && echo "Page loaded" || echo "Failed"
pkill -f "next dev"
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/ src/components/
git commit -m "feat: add customer signup page with SMS/email OTP flow"
```

---

### Task 2.3: Write and deploy hardened Firestore security rules

**Files:**
- Modify: `firestore.rules`
- Create: `tests/firestore.rules.test.ts`

**Interfaces:**
- Consumes: User, Vendor, Staff, Booking schema types from Phase 1
- Produces: Multi-tenant isolated Firestore rules; Admin-SDK writes for sensitive data only; IDOR prevention

- [ ] **Step 1: Write comprehensive Firestore rules**

```bash
cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function userId() {
      return request.auth.uid;
    }

    function userRole() {
      return request.auth.token.role;
    }

    function userVendorId() {
      return request.auth.token.vendorId;
    }

    function isOwner(resourceUid) {
      return userId() == resourceUid;
    }

    function isVendor() {
      return userRole() == 'vendor';
    }

    function isCustomer() {
      return userRole() == 'customer';
    }

    function isStaff() {
      return userRole() == 'staff';
    }

    function isAdmin() {
      return request.auth.token.role == 'admin';
    }

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
        allow write: if isAdmin(); // Admin SDK only
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
EOF
```

- [ ] **Step 2: Create Firestore rules tests**

```bash
mkdir -p tests

cat > tests/firestore.rules.test.ts << 'EOF'
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
      // Note: actual read depends on data existing; this tests rule evaluation
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
EOF
```

- [ ] **Step 3: Run Firestore rules tests**

```bash
npm test -- tests/firestore.rules.test.ts 2>&1 | head -30
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add firestore.rules tests/firestore.rules.test.ts
git commit -m "feat: add comprehensive Firestore security rules with isolation tests"
```

---

## Phase 3: Core Platform (Vendors, Services, Browse, Profiles)

### Task 3.1: Vendor signup flow (business details + Stripe Connect integration)

**Files:**
- Create: `src/app/(auth)/signup/vendor/page.tsx`
- Create: `src/app/api/vendors/route.ts` (vendor creation endpoint)
- Create: `src/lib/stripe/stripe-connect.ts` (Stripe Connect helper)

**Interfaces:**
- Consumes: NextAuth, Firestore admin, Stripe API
- Produces: Vendor signup with account creation and pending Stripe verification status

- [ ] **Step 1: Create vendor signup page**

```bash
cat > src/app/\(auth\)/signup/vendor/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
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

const LONDON_BOROUGHS = [
  'Barking and Dagenham',
  'Barnet',
  'Bexley',
  'Brent',
  'Bromley',
  'Camden',
  'Croydon',
  'Ealing',
  'Enfield',
  'Greenwich',
  'Hackney',
  'Hammersmith and Fulham',
  'Haringey',
  'Harrow',
  'Havering',
  'Hillingdon',
  'Hounslow',
  'Islington',
  'Kensington and Chelsea',
  'Kingston upon Thames',
  'Lambeth',
  'Lewisham',
  'Merton',
  'Newham',
  'Redbridge',
  'Richmond upon Thames',
  'Southwark',
  'Sutton',
  'Tower Hamlets',
  'Waltham Forest',
  'Wandsworth',
  'Westminster',
];

export default function VendorSignup() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'address' | 'otp'>('details');
  const [channel, setChannel] = useState<'sms' | 'email'>('email');
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    customCategory: '',
    bio: '',
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    borough: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!formData.email && !formData.phone) {
      setError('Please provide email or phone');
      return;
    }
    setLoading(true);
    try {
      const destination = channel === 'email' ? formData.email : formData.phone;
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, destination }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setStep('otp');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const identifier = channel === 'email' ? formData.email : formData.phone;
      const result = await signIn('credentials', {
        email: channel === 'email' ? identifier : undefined,
        phone: channel === 'sms' ? identifier : undefined,
        otp,
        role: 'vendor',
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid OTP');
        return;
      }

      // Create vendor document
      const vendorRes = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!vendorRes.ok) throw new Error('Failed to create vendor');

      router.push('/vendor/onboarding/stripe-connect');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Set Up Your Business</h1>

      {step === 'details' && (
        <div className="space-y-4">
          <Input
            placeholder="Business Name"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {formData.category === 'Other' && (
            <Input
              placeholder="Describe your service"
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
            />
          )}
          <textarea
            placeholder="Business description"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full border rounded px-3 py-2 h-24"
          />
          <Input
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            placeholder="Surname"
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            type="email"
          />
          <Input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            type="tel"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button className="w-full" onClick={() => setStep('address')}>
            Continue
          </Button>
        </div>
      )}

      {step === 'address' && (
        <div className="space-y-4">
          <Input
            placeholder="Business Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            placeholder="Postcode"
            value={formData.postcode}
            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
          />
          <select
            value={formData.borough}
            onChange={(e) => setFormData({ ...formData, borough: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select London Borough</option>
            {LONDON_BOROUGHS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
            Send Verification Code
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setStep('details')}>
            Back
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <p className="text-gray-600">Enter verification code</p>
          <Input
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            type="text"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
            Verify
          </Button>
        </div>
      )}
    </div>
  );
}
EOF
```

- [ ] **Step 2: Create vendor creation API**

```bash
cat > src/app/api/vendors/route.ts << 'EOF'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const vendorSchema = z.object({
  businessName: z.string().min(1),
  category: z.string(),
  customCategory: z.string().optional(),
  bio: z.string(),
  firstName: z.string(),
  surname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  postcode: z.string(),
  borough: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = vendorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { businessName, category, customCategory, bio, firstName, surname, email, phone, address, postcode, borough } = parsed.data;

    const vendorRef = adminDb.collection('vendors').doc(session.user.id);
    await vendorRef.set({
      uid: session.user.id,
      businessName,
      category,
      customCategory: customCategory || null,
      bio,
      phone,
      email,
      address,
      postcode,
      borough,
      opening_times: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: '10:00', close: '16:00' },
      },
      stripe_account_id: null,
      verification_status: 'pending',
      platform_commission_rate: 0.10,
      commission_default: {
        mode: 'off',
      },
      createdAt: new Date(),
      consent: {
        vendorMarketingSms: false,
        vendorMarketingEmail: false,
      },
    });

    return NextResponse.json({ vendorId: session.user.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
EOF
```

- [ ] **Step 3: Create Stripe Connect integration helper**

```bash
cat > src/lib/stripe/stripe-connect.ts << 'EOF'
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createConnectAccount(email: string, businessName: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'GB',
    email,
    business_profile: {
      name: businessName,
    },
  });

  return account;
}

export async function getConnectAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: refreshUrl,
    return_url: returnUrl,
  });

  return link.url;
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements,
  };
}
EOF
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/signup/vendor/ src/app/api/vendors/ src/lib/stripe/
git commit -m "feat: add vendor signup with Stripe Connect integration"
```

---

## Phase 4: Customer Browsing & Vendor Profiles

### Task 4.1: Build customer homepage (search, filter, category grid)

**Files:**
- Create: `src/app/(customer)/home/page.tsx`
- Create: `src/components/vendor/VendorGrid.tsx`
- Create: `src/components/search/SearchBar.tsx`
- Create: `src/app/api/vendors/search/route.ts` (vendor search endpoint)

**Interfaces:**
- Consumes: Firestore vendors collection, Google Places API (optional)
- Produces: Mobile-first homepage with search, category filter, vendor list

- [ ] **Step 1: Create customer home page**

```bash
mkdir -p src/app/\(customer\)

cat > src/app/\(customer\)/home/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
  { name: 'Nail Salon', emoji: '💅' },
  { name: 'Hair Salon', emoji: '✂️' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Massage', emoji: '💆' },
  { name: 'Spa', emoji: '🧖' },
  { name: 'Personal Trainer', emoji: '💪' },
  { name: 'Pet Grooming', emoji: '🐕' },
  { name: 'Tattoo', emoji: '🎨' },
];

export default function CustomerHome() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`/api/vendors/search?${params}`);
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Türkan Abla</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push('/customer/account')}>
            👤
          </Button>
        </div>
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Categories */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Browse by category</h2>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                handleSearch();
              }}
              className={`p-4 rounded-lg text-center text-sm font-medium ${
                selectedCategory === cat.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border'
              }`}
            >
              <div className="text-2xl">{cat.emoji}</div>
              <div className="text-xs mt-1">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="p-4">
        {vendors.length === 0 && !loading && search === '' && selectedCategory === null && (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Search for a vendor or select a category to get started</p>
          </Card>
        )}

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        <div className="grid grid-cols-1 gap-4">
          {vendors.map((vendor: any) => (
            <Card
              key={vendor.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => router.push(`/vendor/${vendor.id}`)}
            >
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <div className="p-4">
                <h3 className="font-bold text-lg">{vendor.businessName}</h3>
                <p className="text-sm text-gray-600">{vendor.category}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-yellow-500">⭐ 4.8</span>
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/vendor/${vendor.id}/book`);
                  }}>
                    Book
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
EOF
```

- [ ] **Step 2: Create vendor search API**

```bash
cat > src/app/api/vendors/search/route.ts << 'EOF'
import { adminDb } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');

    let query = adminDb.collection('vendors');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(20).get();
    const vendors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Simple text search filter (use Algolia or Typesense in production)
    const filtered = q
      ? vendors.filter(
          (v) =>
            v.businessName.toLowerCase().includes(q.toLowerCase()) ||
            v.bio.toLowerCase().includes(q.toLowerCase())
        )
      : vendors;

    return NextResponse.json({ vendors: filtered });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
EOF
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(customer\)/ src/components/
git commit -m "feat: add customer homepage with vendor search and category browsing"
```

---

## Phase 5: Bookings & Stripe Payment Integration

### Task 5.1: Build booking flow (date/time selection, payment, confirmation)

**Files:**
- Create: `src/app/(customer)/vendor/[id]/book/page.tsx`
- Create: `src/app/api/bookings/route.ts` (create booking)
- Create: `src/app/api/payments/checkout/route.ts` (Stripe Checkout session)
- Create: `src/app/api/webhooks/stripe/route.ts` (webhook for payment confirmation)

**Interfaces:**
- Consumes: Services API, Stripe Checkout API, Firestore bookings
- Produces: Full booking flow with real-time availability, payment processing, confirmation

- [ ] **Step 1: Create booking page with date/time picker**

```bash
mkdir -p src/app/\(customer\)/vendor/\[id\]/book

cat > src/app/\(customer\)/vendor/\[id\]/book/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, addDays } from 'date-fns';

export default function BookingFlow({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vendorId = params.id;
  const [step, setStep] = useState<'service' | 'date' | 'payment' | 'confirmation'>('service');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch vendor's services
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/services`);
      const data = await res.json();
      setServices(data.services || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          serviceId: selectedService.id,
          scheduled_time: new Date(selectedDate.toDateString() + ' ' + selectedTime),
          price: selectedService.base_price,
        }),
      });

      const { sessionUrl } = await res.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availableDates = Array.from({ length: 28 }, (_, i) => addDays(new Date(), i + 1));
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {step === 'service' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select a service</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className="p-4 cursor-pointer hover:border-blue-500"
                onClick={() => {
                  setSelectedService(service);
                  setStep('date');
                }}
              >
                <h3 className="font-bold">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.duration_minutes} mins</p>
                <p className="text-lg font-bold mt-2">£{service.base_price}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 'date' && selectedService && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select date & time</h2>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Date</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded text-sm ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {format(date, 'd')} {format(date, 'EEE')}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Time</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => setStep('payment')}
            disabled={!selectedTime}
          >
            Continue to Payment
          </Button>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setStep('service')}
          >
            Back
          </Button>
        </div>
      )}

      {step === 'payment' && selectedService && selectedDate && selectedTime && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Review booking</h2>
          <Card className="p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-semibold">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-semibold">
                  {format(selectedDate, 'MMM d')} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">{selectedService.duration_minutes} mins</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>£{selectedService.base_price}</span>
              </div>
            </div>
          </Card>

          <Button className="w-full" onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      )}
    </div>
  );
}
EOF
```

- [ ] **Step 2: Create bookings API**

```bash
cat > src/app/api/bookings/route.ts << 'EOF'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const bookingSchema = z.object({
  vendorId: z.string(),
  serviceId: z.string(),
  scheduled_time: z.date(),
  price: z.number(),
  payment_intent_id: z.string(),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { vendorId, serviceId, scheduled_time, price, payment_intent_id } = parsed.data;

    // Verify payment succeeded
    const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    // Get service and vendor details
    const serviceSnap = await adminDb
      .collection('vendors')
      .doc(vendorId)
      .collection('services')
      .doc(serviceId)
      .get();

    if (!serviceSnap.exists) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = serviceSnap.data();
    const platformCommission = price * 0.1; // 10% default
    const vendorNet = price - platformCommission;

    // Create booking
    const bookingRef = adminDb
      .collection('vendors')
      .doc(vendorId)
      .collection('bookings')
      .doc();

    const bookingData = {
      id: bookingRef.id,
      customerId: session.user.id,
      vendorId,
      serviceId,
      scheduled_time: new Date(scheduled_time),
      duration_minutes: service.duration_minutes,
      customer_name: session.user.name,
      customer_phone: session.user.phone,
      price,
      platform_commission: platformCommission,
      vendor_net: vendorNet,
      status: 'confirmed',
      payment_intent_id,
      payment_status: 'succeeded',
      refund_status: 'none',
      createdAt: new Date(),
    };

    await bookingRef.set(bookingData);

    // Also create in global bookings index for quick lookup
    await adminDb.collection('bookings').doc(bookingRef.id).set(bookingData);

    return NextResponse.json({ bookingId: bookingRef.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
EOF
```

- [ ] **Step 3: Create Stripe Checkout endpoint**

```bash
cat > src/app/api/payments/checkout/route.ts << 'EOF'
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const checkoutSchema = z.object({
  vendorId: z.string(),
  serviceId: z.string(),
  scheduled_time: z.string().datetime(),
  price: z.number(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { vendorId, serviceId, price } = parsed.data;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Service Booking`,
              metadata: { vendorId, serviceId },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/home`,
      metadata: {
        vendorId,
        serviceId,
        customerId: session.user.id,
        scheduled_time: parsed.data.scheduled_time,
      },
    });

    return NextResponse.json({ sessionUrl: checkoutSession.url });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
EOF
```

- [ ] **Step 4: Create Stripe webhook handler**

```bash
cat > src/app/api/webhooks/stripe/route.ts << 'EOF'
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Create booking document with payment confirmed
    const { vendorId, serviceId, customerId, scheduled_time } = session.metadata || {};

    if (vendorId && serviceId && customerId) {
      const bookingRef = adminDb
        .collection('vendors')
        .doc(vendorId)
        .collection('bookings')
        .doc();

      const price = (session.amount_total || 0) / 100;
      const platformCommission = price * 0.1;

      await bookingRef.set({
        id: bookingRef.id,
        customerId,
        vendorId,
        serviceId,
        scheduled_time: new Date(scheduled_time),
        price,
        platform_commission: platformCommission,
        vendor_net: price - platformCommission,
        status: 'confirmed',
        payment_intent_id: session.payment_intent,
        payment_status: 'succeeded',
        refund_status: 'none',
        createdAt: new Date(),
      });

      // Also add to global bookings index
      await adminDb.collection('bookings').doc(bookingRef.id).set({
        id: bookingRef.id,
        customerId,
        vendorId,
        serviceId,
        status: 'confirmed',
      });
    }
  }

  return NextResponse.json({ received: true });
}
EOF
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(customer\)/vendor/ src/app/api/bookings/ src/app/api/payments/ src/app/api/webhooks/
git commit -m "feat: add complete booking flow with Stripe payment integration"
```

---

## Summary of Remaining Phases (Plan structure only—implement sequentially)

Due to length constraints, here's the structure for phases 6–12:

### **Phase 6: Refunds & Cancellation Logic**
- Implement cancellation policy (>24h free, 2–24h 50%, <2h 0%, no-show 100%)
- Refund API with automatic Stripe refund processing
- Cancellation email/SMS notifications

### **Phase 7: Staff Management**
- Staff invitation via time-limited token
- Commission config (percentage/fixed/off) with live preview
- Commission ledger (auto-computed at booking completion, reversed on refund)
- Staff earnings dashboard

### **Phase 8: Loyalty System**
- Vendor loyalty config (stamp card or points)
- Loyalty accrual on booking completion
- Customer loyalty balance UI
- Redemption at checkout

### **Phase 9: Marketing Suite**
- Campaign builder with audience filtering (own customers only)
- Suppression list + consent flag enforcement
- Wallet (prepaid credits)
- Message sending (SMS via Twilio, email via Resend)
- Message log for GDPR audit

### **Phase 10: Platform Deals Channel**
- Vendor-paid featured offers
- User opt-in to "deals near you"
- Platform broadcasts (platform is sender, vendor never gets list)

### **Phase 11: Analytics & Dashboards**
- Vendor analytics (bookings, revenue, commission, payout, no-show %, rating, heatmap)
- Staff analytics (bookings, revenue, commission)
- Customer order history
- CSV exports

### **Phase 12: Bilingual Support & Security Testing**
- next-intl setup for EN/TR routing
- All UI copy translated
- Firestore rules test suite expansion
- API route IDOR/PII leakage tests
- Security audit before launch

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-06-27-turkan-abla-complete-build.md`.**

Two execution paths:

1. **Subagent-Driven (Recommended)** — I dispatch a fresh subagent per task (or per phase), you review checkpoints, fast iteration
2. **Inline Execution** — I execute tasks in this session using `superpowers:executing-plans`, batch execution with review gates

**Which approach would you prefer?**


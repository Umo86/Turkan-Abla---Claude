/**
 * Firestore Collection Schemas and TypeScript Interfaces
 * Comprehensive type definitions for all collections in the Turkan Abla platform
 */

// ============================================================================
// Base Types and Enums
// ============================================================================

export type UserRole = 'customer' | 'vendor' | 'staff' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type CampaignChannel = 'sms' | 'email';
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
export type MessageLogStatus = 'sent' | 'failed' | 'bounced' | 'unsubscribed';
export type SuppressionReason = 'user_opted_out' | 'hard_bounce' | 'complaint' | 'manual';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// ============================================================================
// Consent and Marketing Preference Types
// ============================================================================

export interface ConsentRecord {
  value: boolean;
  ts: number; // Unix timestamp in milliseconds
  source: 'signup' | 'settings' | 'sms_reply' | 'import' | 'api';
  ipHash?: string;
}

export interface ConsentFlags {
  uid: string;
  vendorMarketingSms?: ConsentRecord;
  vendorMarketingEmail?: ConsentRecord;
  platformDealsSms?: ConsentRecord;
  platformDealsEmail?: ConsentRecord;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// User (Customer) Collection
// ============================================================================

export interface UserCustomer {
  uid: string;
  email: string;
  phone: string;
  name: string;
  surname: string;
  borough?: string;
  postcode?: string;
  role: 'customer';

  // Marketing and Communication Preferences
  consent: {
    vendorMarketingSms: ConsentRecord;
    vendorMarketingEmail: ConsentRecord;
    platformDealsSms: ConsentRecord;
    platformDealsEmail: ConsentRecord;
  };

  // Preferences and Loyalty
  dealsPrefs?: {
    categories?: string[];
    minDiscount?: number;
    locationRadius?: number;
  };
  savedVendors?: string[]; // Array of vendor UIDs
  loyaltyBalances?: {
    [vendorId: string]: number; // Balance per vendor
  };

  // Account metadata
  createdAt: number;
  updatedAt: number;
  lastSigninAt?: number;
}

// ============================================================================
// Vendor Collection
// ============================================================================

export interface OpeningHours {
  open: string; // "HH:mm" format (24-hour)
  close: string; // "HH:mm" format (24-hour)
}

export interface OpeningTimes {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
}

export interface LowestPriceConfig {
  minPrice: number;
  discountPercent: number;
}

export interface CommissionConfig {
  defaultRate: number; // Percentage
  staffCanSetOwnRates: boolean;
}

export interface LoyaltyConfig {
  pointsPerPound: number;
  tiers: {
    [key in LoyaltyTier]: {
      minPoints: number;
      maxPoints?: number;
      discountPercent: number;
    };
  };
}

export interface Vendor {
  uid: string;
  businessName: string;
  category: string;
  customCategory?: string;
  bio?: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;

  // Business Metadata
  opening_times: OpeningTimes;
  banner_image_url?: string;
  profile_image_url?: string;

  // Payment and Financial Configuration
  stripe_account_id?: string;
  verification_status: VerificationStatus;

  // Commission and Loyalty
  platform_commission_rate: number; // Percentage
  loyalty_config?: LoyaltyConfig;
  commission_default: CommissionConfig;
  lowest_price_config?: LowestPriceConfig;

  // Marketing Consent
  consent: {
    marketingSms: ConsentRecord;
    marketingEmail: ConsentRecord;
  };

  // Account metadata
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}

// ============================================================================
// Service Collection
// ============================================================================

export interface DynamicPricingRule {
  day_range?: {
    start: number; // 0-6 (Monday-Sunday)
    end: number;
  };
  time_range?: {
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  };
  markup_or_discount_percent: number; // Positive for markup, negative for discount
}

export interface Service {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  duration_minutes: number;
  base_price: number;
  category: string;

  // Service Configuration
  active: boolean;
  staff_required: boolean;
  assigned_staff?: string[]; // Array of staff UIDs

  // Dynamic Pricing
  dynamic_pricing_rules?: DynamicPricingRule[];

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Staff Collection
// ============================================================================

export interface StaffScheduleSlot {
  dayOfWeek: number; // 0-6 (Monday-Sunday)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isAvailable: boolean;
}

export interface Staff {
  uid: string;
  vendorId: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  active: boolean;

  // Commission Configuration
  can_set_own_rates: boolean;
  commissionConfig: {
    type: 'percentage' | 'fixed';
    value: number;
  };

  // Services and Schedule
  services?: string[]; // Array of service IDs
  schedule?: StaffScheduleSlot[];

  // Account metadata
  createdAt: number;
  invitedAt?: number;
  acceptedAt?: number;
  archivedAt?: number;
}

// ============================================================================
// Booking Collection
// ============================================================================

export interface BookingPayment {
  payment_intent_id?: string;
  payment_status: PaymentStatus;
  amount: number;
}

export interface BookingRefund {
  refund_status: RefundStatus;
  refund_amount: number;
  refund_reason?: string;
  processedAt?: number;
}

export interface Booking {
  id: string;
  customerId: string;
  vendorId: string;
  staffId?: string;
  serviceId: string;

  // Booking Details
  scheduled_time: number; // Unix timestamp in milliseconds
  duration_minutes: number;
  customer_name: string;
  customer_phone: string;

  // Pricing and Commission
  price: number;
  discount_percent: number;
  platform_commission: number;
  vendor_net: number;
  staff_commission?: number;

  // Payment and Refund
  payment: BookingPayment;
  refund?: BookingRefund;

  // Booking Status and Notes
  status: BookingStatus;
  cancellation_policy_applied: boolean;
  notes_customer?: string;
  notes_vendor?: string;

  // Communication
  reminder_sent: boolean;
  reminderSentAt?: number;

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Campaign Collection
// ============================================================================

export interface AudienceFilter {
  service?: string[];
  spentRange?: {
    min: number;
    max: number;
  };
  lastBookedRange?: {
    minDaysAgo: number;
    maxDaysAgo: number;
  };
  loyaltyTier?: LoyaltyTier[];
}

export interface Campaign {
  id: string;
  vendorId: string;
  channel: CampaignChannel;
  name: string;

  // Audience and Targeting
  audience_filter: AudienceFilter;
  recipient_count: number;

  // Campaign Content and Cost
  estimated_cost: number;
  actual_cost: number;
  message_body: string;

  // Campaign Status and Scheduling
  status: CampaignStatus;
  scheduled_time?: number; // Unix timestamp in milliseconds
  sent_at?: number; // Unix timestamp in milliseconds

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// MessageLog Collection
// ============================================================================

export interface MessageLog {
  id: string;
  campaignId: string;
  vendorId: string;
  userId: string;
  channel: CampaignChannel;
  message_body: string;
  status: MessageLogStatus;
  cost: number;
  sentAt: number; // Unix timestamp in milliseconds

  // Account metadata
  createdAt: number;
}

// ============================================================================
// Suppression Collection
// ============================================================================

export interface Suppression {
  id: string;
  userId: string;
  channel: CampaignChannel;
  reason: SuppressionReason;
  ts: number; // Unix timestamp in milliseconds

  // Account metadata
  createdAt: number;
}

// ============================================================================
// Offer Collection
// ============================================================================

export interface Offer {
  id: string;
  vendorId: string;
  title: string;
  description?: string;
  discount_percent?: number;
  discount_fixed?: number;
  min_booking_value?: number;

  // Offer Validity
  validFrom: number; // Unix timestamp in milliseconds
  validUntil: number; // Unix timestamp in milliseconds
  maxRedemptions?: number;
  currentRedemptions: number;

  // Audience
  applicable_services?: string[]; // Array of service IDs
  applicable_loyalty_tiers?: LoyaltyTier[];

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Review Collection
// ============================================================================

export interface Review {
  id: string;
  bookingId: string;
  vendorId: string;
  customerId: string;
  serviceId: string;
  staffId?: string;

  // Review Content
  rating: number; // 1-5
  title: string;
  comment?: string;

  // Review Metadata
  visitDate: number; // Unix timestamp in milliseconds
  reviewedAt: number; // Unix timestamp in milliseconds

  // Moderation
  isVerified: boolean;
  isFlagged: boolean;
  moderationNotes?: string;

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Wallet Collection
// ============================================================================

export interface Wallet {
  id: string;
  userId: string;
  vendorId: string;

  // Balance
  balance: number;
  currency: string;

  // Transaction History
  totalEarned: number;
  totalRedeemed: number;

  // Expiry
  expiryDate?: number; // Unix timestamp in milliseconds

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// WalletTransaction Collection
// ============================================================================

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  vendorId: string;

  // Transaction Details
  type: 'earn' | 'redeem';
  amount: number;
  description: string;

  // Related Entity
  bookingId?: string;
  offerId?: string;

  // Transaction Status
  status: 'pending' | 'completed' | 'failed';

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Admin Collection
// ============================================================================

export interface Admin {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';

  // Permissions
  permissions: string[];

  // Account metadata
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Analytics Collection (Optional but useful for tracking)
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  vendorId?: string;

  // Event Details
  properties: Record<string, unknown>;

  // Account metadata
  createdAt: number;
}

// ============================================================================
// Helper Types for Collections
// ============================================================================

export type FirestoreCollection =
  | UserCustomer
  | Vendor
  | Service
  | Staff
  | Booking
  | Campaign
  | MessageLog
  | Suppression
  | ConsentFlags
  | Offer
  | Review
  | Wallet
  | WalletTransaction
  | Admin
  | AnalyticsEvent;

// ============================================================================
// Firestore Document Reference Types (for use with Firestore SDK)
// ============================================================================

export interface FirestoreDocumentMeta {
  id: string;
  path: string;
  createdAt: number;
  updatedAt: number;
}

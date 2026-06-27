/**
 * Stripe Connect Account Management
 * Helpers for creating and managing vendor Stripe Connect accounts
 */

// ============================================================================
// Lazy Initialization
// ============================================================================

let stripeInstance: any = null;

function getStripeInstance() {
  if (!stripeInstance) {
    const Stripe = require('stripe').default;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  }
  return stripeInstance;
}

// ============================================================================
// Public Functions
// ============================================================================

/**
 * Create a Stripe Express Account for a vendor
 * @param email Vendor's email address
 * @param businessName Vendor's business name
 * @returns Account ID and other details
 */
export async function createConnectAccount(
  email: string,
  businessName: string
): Promise<{
  success: boolean;
  accountId?: string;
  error?: string;
}> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = getStripeInstance();
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'GB',
      email,
      business_profile: {
        name: businessName,
        mcc: '7298', // Professional services, default MCC
        support_phone: undefined, // Can be added later
        url: undefined, // Can be added during onboarding
      },
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    console.error('Failed to create Stripe Connect account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Stripe account',
    };
  }
}

/**
 * Get onboarding link for a Stripe Express Account
 * @param accountId Stripe account ID
 * @param refreshUrl URL to refresh if link expires
 * @param returnUrl URL to return to after onboarding
 * @returns Onboarding URL
 */
export async function getConnectAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = getStripeInstance();
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return {
      success: true,
      url: link.url,
    };
  } catch (error) {
    console.error('Failed to get Stripe Connect onboarding link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get onboarding link',
    };
  }
}

/**
 * Get Stripe Account verification status
 * @param accountId Stripe account ID
 * @returns Account details including verification status
 */
export async function getAccountStatus(
  accountId: string
): Promise<{
  success: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: any;
  error?: string;
}> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = getStripeInstance();
    const account = await stripe.accounts.retrieve(accountId);

    return {
      success: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
    };
  } catch (error) {
    console.error('Failed to get Stripe account status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get account status',
    };
  }
}

/**
 * Verify that a Stripe Secret Key is valid (for testing)
 * @returns True if valid, false otherwise
 */
export async function verifyStripeKey(): Promise<boolean> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return false;
    }

    // Try to retrieve a test account
    const stripe = getStripeInstance();
    await stripe.accounts.list({ limit: 1 });
    return true;
  } catch (error) {
    return false;
  }
}

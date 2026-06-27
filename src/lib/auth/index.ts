/**
 * Authentication Helpers and Route Configuration
 * Defines protected routes, public routes, and NextAuth configuration
 */

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Authentication routes used in NextAuth configuration
 * These paths handle signin, signup, and auth callbacks
 */
export const AUTH_ROUTES = {
  signin: '/auth/signin',
  signup: '/auth/signup',
  callback: '/api/auth/callback',
  error: '/auth/error',
  verifyRequest: '/auth/verify-request',
} as const;

/**
 * Protected routes that require authentication
 * Users without a valid session will be redirected to signin
 */
export const PROTECTED_ROUTES = {
  customer: {
    dashboard: '/customer/dashboard',
    bookings: '/customer/bookings',
    bookingDetail: (id: string) => `/customer/bookings/${id}`,
    vendors: '/customer/vendors',
    vendorDetail: (id: string) => `/customer/vendors/${id}`,
    reviews: '/customer/reviews',
    profile: '/customer/profile',
    settings: '/customer/settings',
  },
  vendor: {
    dashboard: '/vendor/dashboard',
    services: '/vendor/services',
    serviceDetail: (id: string) => `/vendor/services/${id}`,
    staff: '/vendor/staff',
    bookings: '/vendor/bookings',
    bookingDetail: (id: string) => `/vendor/bookings/${id}`,
    campaigns: '/vendor/campaigns',
    campaignDetail: (id: string) => `/vendor/campaigns/${id}`,
    analytics: '/vendor/analytics',
    profile: '/vendor/profile',
    settings: '/vendor/settings',
    wallet: '/vendor/wallet',
  },
  staff: {
    dashboard: '/staff/dashboard',
    bookings: '/staff/bookings',
    bookingDetail: (id: string) => `/staff/bookings/${id}`,
    schedule: '/staff/schedule',
    profile: '/staff/profile',
    settings: '/staff/settings',
    wallet: '/staff/wallet',
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    userDetail: (id: string) => `/admin/users/${id}`,
    vendors: '/admin/vendors',
    vendorDetail: (id: string) => `/admin/vendors/${id}`,
    bookings: '/admin/bookings',
    campaigns: '/admin/campaigns',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
  },
} as const;

/**
 * Public routes accessible without authentication
 */
export const PUBLIC_ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  faq: '/faq',
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
} as const;

/**
 * API routes that should be accessible to public
 */
export const PUBLIC_API_ROUTES = [
  '/api/auth/',
  '/api/health',
] as const;

/**
 * API routes that require authentication
 */
export const PROTECTED_API_ROUTES = {
  user: '/api/user',
  vendor: '/api/vendor',
  bookings: '/api/bookings',
  services: '/api/services',
  campaigns: '/api/campaigns',
  reviews: '/api/reviews',
  analytics: '/api/analytics',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a path is a public route
 */
export const isPublicRoute = (path: string): boolean => {
  const publicPaths = Object.values(PUBLIC_ROUTES).filter((p) => typeof p === 'string') as string[];
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath));
};

/**
 * Check if a path is a protected route
 */
export const isProtectedRoute = (path: string): boolean => {
  // Check all protected routes across all roles
  const allProtectedRoutes = [
    ...Object.values(PROTECTED_ROUTES.customer),
    ...Object.values(PROTECTED_ROUTES.vendor),
    ...Object.values(PROTECTED_ROUTES.staff),
    ...Object.values(PROTECTED_ROUTES.admin),
  ];

  return allProtectedRoutes.some(protectedPath =>
    typeof protectedPath === 'string' && (path === protectedPath || path.startsWith(protectedPath))
  );
};

/**
 * Check if a path is an auth route
 */
export const isAuthRoute = (path: string): boolean => {
  const authPaths = Object.values(AUTH_ROUTES);
  return authPaths.some(authPath => path === authPath || path.startsWith(authPath));
};

/**
 * Get the login redirect path based on user role
 */
export const getDefaultDashboardPath = (role?: string): string => {
  switch (role) {
    case 'vendor':
      return PROTECTED_ROUTES.vendor.dashboard;
    case 'staff':
      return PROTECTED_ROUTES.staff.dashboard;
    case 'admin':
      return PROTECTED_ROUTES.admin.dashboard;
    case 'customer':
    default:
      return PROTECTED_ROUTES.customer.dashboard;
  }
};

/**
 * Get the signin path
 */
export const getSigninPath = (callbackUrl?: string): string => {
  if (callbackUrl) {
    return `${AUTH_ROUTES.signin}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return AUTH_ROUTES.signin;
};

/**
 * Get the signup path
 */
export const getSignupPath = (role?: string, callbackUrl?: string): string => {
  let path = AUTH_ROUTES.signup;
  if (role) {
    path += `?role=${role}`;
    if (callbackUrl) {
      path += `&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }
  } else if (callbackUrl) {
    path += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return path;
};

// ============================================================================
// NextAuth Configuration Defaults
// ============================================================================

/**
 * Default NextAuth options (to be used with NextAuth.js)
 * These are base configurations; actual NextAuth should extend these
 */
export const authConfig = {
  providers: [
    // Firebase adapter will be configured here
  ],
  pages: {
    signIn: AUTH_ROUTES.signin,
    error: AUTH_ROUTES.error,
  },
  callbacks: {
    // Callbacks will be implemented in the NextAuth setup
  },
  events: {
    // Events will be logged here
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} as const;

// ============================================================================
// Session and Token Types
// ============================================================================

/**
 * Extended NextAuth session with custom user properties
 */
export interface AuthSession {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role: 'customer' | 'vendor' | 'staff' | 'admin';
    vendorId?: string;
    verified: boolean;
    emailVerified?: Date | null;
  };
  expires: string;
}

/**
 * Extended NextAuth token with custom properties
 */
export interface AuthToken {
  sub: string; // User UID
  id?: string;
  email?: string;
  name?: string;
  image?: string;
  role: 'customer' | 'vendor' | 'staff' | 'admin';
  vendorId?: string;
  verified: boolean;
  emailVerified?: boolean;
  iat: number; // Issued at
  exp: number; // Expiration
}

// ============================================================================
// NextAuth Module Augmentation
// ============================================================================

/**
 * Augment next-auth module types for TypeScript support
 * This ensures that session and token have our custom properties
 */
declare module 'next-auth' {
  interface Session extends AuthSession {}
  interface JWT extends AuthToken {}
}

// ============================================================================
// Error Messages
// ============================================================================

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'Email is already registered',
  EMAIL_NOT_VERIFIED: 'Please verify your email before signing in',
  WEAK_PASSWORD: 'Password is too weak',
  INVALID_EMAIL: 'Invalid email address',
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FIREBASE_ERROR: 'An error occurred with Firebase',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const;

// ============================================================================
// Utility Constants
// ============================================================================

/**
 * Roles in the application
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

/**
 * Session storage key in localStorage
 */
export const SESSION_STORAGE_KEY = 'next-auth.session-token';

/**
 * CSRF token cookie name
 */
export const CSRF_COOKIE_NAME = 'next-auth.csrf-token';

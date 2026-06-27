/**
 * Authentication Layout
 * Shared layout for all auth pages (signin, signup, error)
 * Gradient background with centered card container
 */

import type { ReactNode } from 'react';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

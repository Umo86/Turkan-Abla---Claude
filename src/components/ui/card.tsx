/**
 * Card Component
 * Container for card-based content
 */

import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}
      {...props}
    />
  )
);

Card.displayName = 'Card';

const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props} />
  )
);

CardContent.displayName = 'CardContent';

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`px-6 py-4 border-b border-slate-200 ${className}`} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h2 ref={ref} className={`text-2xl font-bold text-slate-900 ${className}`} {...props} />
  )
);

CardTitle.displayName = 'CardTitle';

export { Card, CardContent, CardHeader, CardTitle };

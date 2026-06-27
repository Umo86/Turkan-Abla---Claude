/**
 * Checkbox Component
 * Reusable checkbox with label support
 */

import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, id, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={`mt-1 w-5 h-5 accent-blue-600 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
          {...props}
        />
        {label && (
          <div className="flex-1 min-w-0">
            <label htmlFor={id} className="text-sm font-medium text-slate-900 cursor-pointer block">
              {label}
            </label>
            {description && (
              <p className="text-xs text-slate-600 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

// ============================================
// MIMOZ - Input Component
// ============================================

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border rounded-lg text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-slate-200',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

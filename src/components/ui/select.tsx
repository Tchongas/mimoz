// ============================================
// Tapresente - Select Component
// ============================================

import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full px-4 py-3 border rounded-lg text-slate-900 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:cursor-not-allowed',
        error ? 'border-red-500' : 'border-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

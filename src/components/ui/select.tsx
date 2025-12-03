// ============================================
// MIMOZ - Select Component
// ============================================

import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 border rounded-lg text-slate-900 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent',
        'disabled:bg-slate-100 disabled:cursor-not-allowed',
        error ? 'border-red-500' : 'border-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

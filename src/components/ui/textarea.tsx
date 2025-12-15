// ============================================
// Tapresente - Textarea Component
// ============================================

import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-3 border rounded-lg text-slate-900 placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:cursor-not-allowed',
        'min-h-[100px] resize-none',
        error ? 'border-red-500' : 'border-slate-200',
        className
      )}
      {...props}
    />
  );
}

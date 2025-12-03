// ============================================
// MIMOZ - Textarea Component
// ============================================

import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent',
        'disabled:bg-slate-100 disabled:cursor-not-allowed',
        'min-h-[100px] resize-y',
        error ? 'border-red-500' : 'border-slate-300',
        className
      )}
      {...props}
    />
  );
}

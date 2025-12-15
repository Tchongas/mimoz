// ============================================
// Tapresente - Empty State Component
// ============================================
// Reusable component for empty tables/lists

import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      
      <h3 className="text-lg font-medium text-slate-900 mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-slate-500 mb-4">
          {description}
        </p>
      )}
      
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

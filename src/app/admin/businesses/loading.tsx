// ============================================
// Tapresente - Admin Businesses Loading State
// ============================================

import { SkeletonTable } from '@/components/ui';

export default function BusinessesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}

// ============================================
// MIMOZ - Business Analytics Loading State
// ============================================

import { SkeletonStats, SkeletonCard, Skeleton } from '@/components/ui';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <SkeletonStats count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="flex-1 h-6 rounded-full" />
                <Skeleton className="w-8 h-4" />
              </div>
            ))}
          </div>
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
}

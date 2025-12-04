// ============================================
// MIMOZ - Business Cards Loading State
// ============================================

import { SkeletonStats, SkeletonTable, Skeleton } from '@/components/ui';

export default function CardsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <SkeletonStats count={3} />
      <SkeletonTable rows={4} />
    </div>
  );
}

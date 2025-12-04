// ============================================
// MIMOZ - Admin Reports Loading State
// ============================================

import { SkeletonStats, SkeletonTable, Skeleton } from '@/components/ui';

export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <SkeletonStats count={4} />
      <SkeletonTable rows={6} />
    </div>
  );
}

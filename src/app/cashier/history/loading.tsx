// ============================================
// MIMOZ - Cashier History Loading State
// ============================================

import { SkeletonTable, Skeleton } from '@/components/ui';

export default function HistoryLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}

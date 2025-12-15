// ============================================
// Tapresente - Admin New Business Loading State
// ============================================

import { SkeletonForm, Skeleton } from '@/components/ui';

export default function NewBusinessLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <SkeletonForm />
    </div>
  );
}

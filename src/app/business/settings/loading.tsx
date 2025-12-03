// ============================================
// MIMOZ - Business Settings Loading State
// ============================================

import { SkeletonForm, Skeleton } from '@/components/ui';

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <SkeletonForm />
    </div>
  );
}

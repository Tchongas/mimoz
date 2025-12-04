// ============================================
// MIMOZ - Store Loading State
// ============================================

import { Skeleton } from '@/components/ui';

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white animate-in fade-in duration-150">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Skeleton className="h-10 w-80 mx-auto mb-4 bg-slate-700" />
          <Skeleton className="h-6 w-96 mx-auto bg-slate-700" />
        </div>
      </section>

      {/* Cards Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <Skeleton className="h-40 rounded-none" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-28 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

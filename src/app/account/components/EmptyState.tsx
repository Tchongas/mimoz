'use client';

import Link from 'next/link';
import { Gift, Store, Sparkles, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LastVisitedStore {
  slug: string;
  name: string;
}

export function EmptyState() {
  const [lastStore, setLastStore] = useState<LastVisitedStore | null>(null);

  useEffect(() => {
    // Check localStorage for last visited store
    const stored = localStorage.getItem('tapresente_last_store');
    if (stored) {
      try {
        setLastStore(JSON.parse(stored));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-3xl p-12 text-center">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200/50 rotate-3">
          <Gift className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
          Sua carteira está vazia
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Você ainda não tem vale-presentes. Explore as lojas parceiras e descubra presentes incríveis para você ou para quem você ama.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {lastStore && (
            <Link
              href={`/store/${lastStore.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-violet-200 text-violet-700 rounded-xl hover:bg-violet-50 hover:border-violet-300 transition-all font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para {lastStore.name}
            </Link>
          )}
          
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-200/50 font-medium"
          >
            <Store className="w-5 h-5" />
            Ver todas as lojas
          </Link>
        </div>
      </div>
    </div>
  );
}

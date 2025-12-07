import Link from 'next/link';
import { Gift, Store } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Gift className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-lg font-medium text-slate-900 mb-2">
        Nenhuma compra ainda
      </h2>
      <p className="text-slate-500 mb-6 text-sm max-w-md mx-auto">
        Você ainda não comprou nenhum vale-presente. Explore as lojas parceiras e comece a presentear.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
      >
        <Store className="w-4 h-4" />
        Explorar lojas
      </Link>
    </div>
  );
}

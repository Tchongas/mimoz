// ============================================
// Tapresente - All Stores Page
// ============================================
// Lists all businesses/stores

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Store, ArrowLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'Lojas Parceiras | Tapresente',
  description: 'Explore todas as lojas parceiras e encontre o presente perfeito',
};

export default async function StoresPage() {
  const supabase = await createClient();
  
  // Get all businesses from schema
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, slug, logo_url, description, gift_card_color')
    .order('name');
  
  if (error) {
    console.error('[Stores] Error fetching businesses:', error);
  }
  
  const allBusinesses = businesses || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/account" 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Minha Conta</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Tapresente" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-slate-900">Tapresente</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Lojas Parceiras</h1>
        </div>
        
        {/* Stores List */}
        {allBusinesses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma loja disponível</h2>
            <p className="text-slate-600">Em breve teremos lojas parceiras.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/store/${business.slug}`}
                className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all duration-200"
              >
                {/* Logo */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: business.gift_card_color || '#6366f1' }}
                >
                  {business.logo_url ? (
                    <Image
                      src={business.logo_url}
                      alt={business.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-white" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
                    {business.name}
                  </h3>
                  {business.description && (
                    <p className="text-sm text-slate-500 truncate">
                      {business.description}
                    </p>
                  )}
                </div>
                
                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

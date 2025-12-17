// ============================================
// Tapresente - All Stores Page
// ============================================
// Lists all active businesses/stores

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Store, ArrowLeft, Gift } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'Lojas Parceiras | Tapresente',
  description: 'Explore todas as lojas parceiras e encontre o presente perfeito',
};

export default async function StoresPage() {
  const supabase = await createClient();
  
  // Get all active businesses
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      logo_url,
      description,
      gift_card_color,
      gift_card_templates (
        id,
        is_active
      )
    `)
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    console.error('[Stores] Error fetching businesses:', error);
  }
  
  // Filter to only show businesses with at least one active template
  const activeBusinesses = (businesses || []).filter(
    b => b.gift_card_templates?.some((t: { is_active: boolean }) => t.is_active)
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-200/50">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Lojas Parceiras</h1>
          <p className="text-slate-600 max-w-md mx-auto">
            Explore nossas lojas parceiras e encontre o presente perfeito para quem você ama
          </p>
        </div>
        
        {/* Stores Grid */}
        {activeBusinesses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma loja disponível</h2>
            <p className="text-slate-600">Em breve teremos lojas parceiras incríveis para você.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBusinesses.map((business) => {
              const activeTemplatesCount = business.gift_card_templates?.filter(
                (t: { is_active: boolean }) => t.is_active
              ).length || 0;
              
              return (
                <Link
                  key={business.id}
                  href={`/store/${business.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  {/* Card Header with Color */}
                  <div 
                    className="h-24 relative"
                    style={{ backgroundColor: business.gift_card_color || '#6366f1' }}
                  >
                    {business.logo_url ? (
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-lg p-1 group-hover:scale-105 transition-transform">
                          <Image
                            src={business.logo_url}
                            alt={business.name}
                            width={56}
                            height={56}
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Store className="w-8 h-8 text-slate-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Content */}
                  <div className="pt-12 pb-6 px-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                      {business.name}
                    </h3>
                    {business.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {business.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Gift className="w-4 h-4" />
                      <span>{activeTemplatesCount} {activeTemplatesCount === 1 ? 'vale-presente' : 'vale-presentes'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

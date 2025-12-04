// ============================================
// MIMOZ - Public Store Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gift, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface GiftCardTemplate {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  image_url: string | null;
}

async function getStoreData(slug: string) {
  const supabase = await createClient();

  // Get business by slug
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (bizError || !business) {
    return null;
  }

  // Get active gift card templates
  const { data: templates } = await supabase
    .from('gift_card_templates')
    .select('id, name, description, amount_cents, image_url')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('amount_cents', { ascending: true });

  return {
    business,
    templates: templates || [],
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) {
    notFound();
  }

  const { business, templates } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Presenteie quem você ama
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Escolha o valor perfeito e envie um vale-presente digital instantaneamente.
            Válido em qualquer unidade {business.name}.
          </p>
        </div>
      </section>

      {/* Gift Cards Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Escolha seu Vale-Presente
          </h3>

          {templates.length === 0 ? (
            <div className="text-center py-16">
              <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-slate-900 mb-2">
                Em breve!
              </h4>
              <p className="text-slate-500">
                Estamos preparando nossos vale-presentes. Volte em breve!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Link
                  key={template.id}
                  href={`/store/${slug}/buy/${template.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1">
                    {/* Card Image/Gradient */}
                    <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-white">
                          {formatCurrency(template.amount_cents)}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">Vale-Presente</p>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full" />
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">
                        {template.name}
                      </h4>
                      {template.description && (
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-slate-900">
                          {formatCurrency(template.amount_cents)}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium group-hover:bg-slate-800 transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          Comprar
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Vale-presentes digitais por {business.name}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Powered by Mimoz
          </p>
        </div>
      </footer>
    </div>
  );
}

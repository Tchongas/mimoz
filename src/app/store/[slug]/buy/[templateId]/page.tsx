// ============================================
// MIMOZ - Gift Card Purchase Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PurchaseForm } from './purchase-form';

interface BuyPageProps {
  params: Promise<{ slug: string; templateId: string }>;
}

// Default colors
const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  giftCard: '#1e3a5f',
};

async function getTemplateData(slug: string, templateId: string) {
  const supabase = await createClient();

  // Get business by slug with customization fields
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, primary_color, secondary_color, gift_card_color')
    .eq('slug', slug)
    .single();

  if (!business) return null;

  // Get template
  const { data: template } = await supabase
    .from('gift_card_templates')
    .select('*')
    .eq('id', templateId)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .single();

  if (!template) return null;

  return { business, template };
}

export default async function BuyPage({ params }: BuyPageProps) {
  const { slug, templateId } = await params;
  const data = await getTemplateData(slug, templateId);

  if (!data) {
    notFound();
  }

  const { business, template } = data;

  // Get colors with fallbacks - template color overrides business default
  const primaryColor = business.primary_color || DEFAULT_COLORS.primary;
  const secondaryColor = business.secondary_color || DEFAULT_COLORS.secondary;
  const giftCardColor = template.card_color || business.gift_card_color || DEFAULT_COLORS.giftCard;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/store/${slug}`}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Gift className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Preview */}
          <div>
            <div 
              className="rounded-2xl p-8 text-white aspect-[3/2] flex flex-col justify-between relative overflow-hidden"
              style={{ backgroundColor: giftCardColor }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <p className="text-white/60 text-sm">Vale-Presente</p>
                <h2 className="text-2xl font-bold mt-1">{business.name}</h2>
              </div>
              
              <div className="relative">
                <p className="text-5xl font-bold">
                  {formatCurrency(template.amount_cents)}
                </p>
                <p className="text-white/60 text-sm mt-2">
                  {template.name}
                </p>
              </div>
            </div>

            {template.description && (
              <div className="mt-6 p-4 bg-slate-100 rounded-xl">
                <h3 className="font-medium text-slate-900 mb-2">Sobre este vale-presente</h3>
                <p className="text-slate-600 text-sm">{template.description}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">Como funciona</h3>
              <ul className="text-blue-700 text-sm space-y-2">
                <li>• Após a compra, você receberá o código por email</li>
                <li>• O destinatário também receberá uma cópia</li>
                <li>• Válido por {template.valid_days} dias após a compra</li>
                <li>• Pode ser usado em qualquer unidade</li>
              </ul>
            </div>
          </div>

          {/* Purchase Form */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Finalizar Compra
              </h2>
              <PurchaseForm 
                businessId={business.id}
                businessSlug={business.slug}
                templateId={template.id}
                amount={template.amount_cents}
                accentColor={secondaryColor}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs">
            Powered by Mimoz
          </p>
        </div>
      </footer>
    </div>
  );
}

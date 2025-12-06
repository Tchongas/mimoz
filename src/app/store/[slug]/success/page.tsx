// ============================================
// MIMOZ - Purchase Success Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Gift, Copy, Mail, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CopyCodeButton } from './copy-code-button';

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}

// Default colors
const DEFAULT_COLORS = {
  giftCard: '#1e3a5f',
};

async function getGiftCardData(code: string) {
  const supabase = await createClient();

  const { data: giftCard } = await supabase
    .from('gift_cards')
    .select(`
      *,
      business:businesses(id, name, slug, gift_card_color),
      template:gift_card_templates(card_color)
    `)
    .eq('code', code)
    .single();

  return giftCard;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { slug } = await params;
  const { code } = await searchParams;

  if (!code) {
    notFound();
  }

  const giftCard = await getGiftCardData(code);

  if (!giftCard || giftCard.business?.slug !== slug) {
    notFound();
  }

  // Get gift card color with fallbacks
  const giftCardColor = giftCard.template?.card_color || giftCard.business?.gift_card_color || DEFAULT_COLORS.giftCard;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{giftCard.business.name}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Compra realizada!
          </h2>
          <p className="text-slate-600">
            Seu vale-presente foi criado com sucesso
          </p>
        </div>

        {/* Gift Card Display */}
        <div 
          className="rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
          style={{ backgroundColor: giftCardColor }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <p className="text-slate-400 text-sm">Vale-Presente</p>
            <h3 className="text-2xl font-bold mt-1 mb-6">{giftCard.business.name}</h3>
            
            <div className="text-center py-6">
              <p className="text-5xl font-bold mb-2">
                {formatCurrency(giftCard.amount_cents)}
              </p>
              <p className="text-slate-400">Saldo disponível</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mt-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Código</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-mono font-bold tracking-wider">
                  {giftCard.code}
                </p>
                <CopyCodeButton code={giftCard.code} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Enviado para</span>
            </div>
            <p className="font-medium text-slate-900">{giftCard.recipient_name}</p>
            <p className="text-sm text-slate-600">{giftCard.recipient_email}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Válido até</span>
            </div>
            <p className="font-medium text-slate-900">
              {new Date(giftCard.expires_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {giftCard.recipient_message && (
          <div 
            className="rounded-xl border p-4 mb-8"
            style={{ 
              backgroundColor: `${giftCardColor}10`, 
              borderColor: `${giftCardColor}30` 
            }}
          >
            <p className="text-sm mb-1" style={{ color: `${giftCardColor}cc` }}>Mensagem:</p>
            <p className="italic" style={{ color: giftCardColor }}>"{giftCard.recipient_message}"</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <h4 className="font-medium text-slate-900 mb-3">Como usar</h4>
          <ol className="text-slate-600 text-sm space-y-2">
            <li>1. Apresente o código no caixa de qualquer unidade {giftCard.business.name}</li>
            <li>2. O operador irá validar e aplicar o desconto na sua compra</li>
            <li>3. Se o valor da compra for menor, o saldo restante fica disponível</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/store/${slug}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Comprar outro
          </Link>
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

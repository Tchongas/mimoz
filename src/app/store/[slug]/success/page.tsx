// ============================================
// MIMOZ - Purchase Success Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gift, Home, User } from 'lucide-react';
import Footer from '@/components/ui/footer';
import { CelebrationBanner } from './components/CelebrationBanner';
import { GiftCardDisplay } from './components/GiftCardDisplay';
import { InfoGrid } from './components/InfoGrid';

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
      business:businesses(id, name, slug, gift_card_color, logo_url),
      template:gift_card_templates(card_color, name)
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
  const isGift = giftCard.recipient_email !== giftCard.purchaser_email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {giftCard.business.logo_url ? (
                <img 
                  src={giftCard.business.logo_url} 
                  alt={giftCard.business.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: giftCardColor }}
                >
                  <Gift className="w-5 h-5 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold text-slate-900">{giftCard.business.name}</h1>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Minha Conta</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 relative animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <CelebrationBanner
            isGift={isGift}
            recipientName={giftCard.recipient_name}
          />

          <GiftCardDisplay
            businessName={giftCard.business.name}
            templateName={giftCard.template?.name}
            amountCents={giftCard.amount_cents}
            code={giftCard.code}
            giftCardColor={giftCardColor}
          />

          <InfoGrid
            recipientName={giftCard.recipient_name}
            recipientEmail={giftCard.recipient_email}
            expiresAt={giftCard.expires_at}
            businessName={giftCard.business.name}
            code={giftCard.code}
          />

          {/* Personal Message */}
          {giftCard.recipient_message && (
            <div 
              className="rounded-2xl p-4 mb-6 border"
              style={{ 
                backgroundColor: `${giftCardColor}08`, 
                borderColor: `${giftCardColor}20` 
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${giftCardColor}15` }}
                >
                  <span className="text-sm">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: giftCardColor }}>
                    Mensagem de {giftCard.purchaser_name || 'você'}
                  </p>
                  <p className="text-slate-600 italic">"{giftCard.recipient_message}"</p>
                </div>
              </div>
            </div>
          )}

          {/* How to use - Compact */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">?</span>
              Como usar
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                <span>Vá até qualquer unidade <strong>{giftCard.business.name}</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                <span>Apresente o código <strong className="font-mono">{giftCard.code}</strong> no caixa</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                <span>O saldo será descontado automaticamente</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/store/${slug}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Gift className="w-4 h-4" />
              Comprar outro
            </Link>
            <Link
              href="/account"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-white rounded-xl font-medium transition-colors shadow-sm"
              style={{ backgroundColor: giftCardColor }}
            >
              <Home className="w-4 h-4" />
              Meus vale-presentes
            </Link>
          </div>

          {/* Email notice */}
          <p className="text-center text-xs text-slate-400 mt-6">
            📧 Um email de confirmação foi enviado para você e para o destinatário
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

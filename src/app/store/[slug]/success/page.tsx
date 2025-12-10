// ============================================
// MIMOZ - Purchase Success Page
// ============================================

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gift, Home, User, Download, Sparkles } from 'lucide-react';
import Footer from '@/components/ui/footer';
import { GiftCardDisplay } from './components/GiftCardDisplay';
import { InfoGrid } from './components/InfoGrid';
import { PaymentPending } from './components/PaymentPending';
import { SuccessConfetti } from './components/SuccessConfetti';

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

  // If card is PENDING and user reached success page, activate it
  // AbacatePay only redirects to completionUrl after payment is confirmed
  // Use service client to bypass RLS (user might not be authenticated)
  console.log('[SuccessPage] Gift card status:', giftCard?.id, giftCard?.status);
  
  if (giftCard && giftCard.status === 'PENDING') {
    console.log('[SuccessPage] Attempting to activate gift card:', giftCard.id);
    
    // Use service role client to bypass RLS policies
    const serviceClient = createServiceClient();
    
    // First verify the card exists with service client
    const { data: checkCard } = await serviceClient
      .from('gift_cards')
      .select('id, status')
      .eq('id', giftCard.id)
      .single();
    
    console.log('[SuccessPage] Service client check:', checkCard);
    
    if (checkCard) {
      const { error } = await serviceClient
        .from('gift_cards')
        .update({
          status: 'ACTIVE',
          payment_status: 'COMPLETED',
        })
        .eq('id', giftCard.id);
      
      if (error) {
        console.error('[SuccessPage] Error activating gift card:', error);
      } else {
        // Verify the update persisted
        const { data: verifyCard } = await serviceClient
          .from('gift_cards')
          .select('id, status, payment_status')
          .eq('id', giftCard.id)
          .single();
        
        console.log('[SuccessPage] After update verification:', verifyCard);
        
        if (verifyCard?.status === 'ACTIVE') {
          console.log('[SuccessPage] Gift card activated and verified!');
          giftCard.status = 'ACTIVE';
          giftCard.payment_status = 'COMPLETED';
        } else {
          console.error('[SuccessPage] Update did not persist! Card still:', verifyCard?.status);
        }
      }
    } else {
      console.error('[SuccessPage] Card not found with service client - check SUPABASE_SERVICE_ROLE_KEY');
    }
  }

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

  // Check if payment is still pending
  const isPending = giftCard.status === 'PENDING';

  // Get gift card color with fallbacks
  const giftCardColor = giftCard.template?.card_color || giftCard.business?.gift_card_color || DEFAULT_COLORS.giftCard;
  const isGift = giftCard.recipient_email !== giftCard.purchaser_email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col overflow-hidden">
      {/* Confetti on success */}
      {!isPending && <SuccessConfetti />}
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: giftCardColor }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: giftCardColor }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {giftCard.business.logo_url ? (
                <img 
                  src={giftCard.business.logo_url} 
                  alt={giftCard.business.name}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: giftCardColor }}
                >
                  <Gift className="w-5 h-5 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold text-slate-900">{giftCard.business.name}</h1>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Minha Conta</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
          {isPending ? (
            <PaymentPending giftCardId={giftCard.id} giftCardCode={giftCard.code} />
          ) : (
            <>
              {/* Celebration Header */}
              <div className="text-center mb-10 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                {/* Animated celebration icon */}
                <div className="relative mb-6 flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 animate-ping opacity-30" />
                  <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 animate-pulse opacity-50" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>✨</div>
                  <div className="absolute -bottom-1 -left-2 text-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🎉</div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                  {isGift ? (
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      🎁 Presente Enviado!
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      🎉 Parabéns!
                    </span>
                  )}
                </h1>
                
                <p className="text-slate-600 text-lg">
                  {isGift ? (
                    <>
                      <span className="font-semibold text-purple-600">{giftCard.recipient_name || 'O destinatário'}</span>
                      {' '}vai adorar esse presente!
                    </>
                  ) : (
                    'Seu vale-presente está pronto para usar!'
                  )}
                </p>
              </div>

              {/* Gift Card Display with message integrated */}
              <GiftCardDisplay
                businessName={giftCard.business.name}
                templateName={giftCard.template?.name}
                amountCents={giftCard.amount_cents}
                code={giftCard.code}
                giftCardColor={giftCardColor}
                recipientName={giftCard.recipient_name}
                recipientMessage={giftCard.recipient_message}
                senderName={giftCard.purchaser_name}
                isGift={isGift}
                isCustom={giftCard.is_custom}
                customTitle={giftCard.custom_title}
                customEmoji={giftCard.custom_emoji}
                customBgType={giftCard.custom_bg_type}
                customBgColor={giftCard.custom_bg_color}
                customBgGradientStart={giftCard.custom_bg_gradient_start}
                customBgGradientEnd={giftCard.custom_bg_gradient_end}
                customTextColor={giftCard.custom_text_color}
              />

              {/* Info Grid */}
              <InfoGrid
                recipientName={giftCard.recipient_name}
                recipientEmail={giftCard.recipient_email}
                expiresAt={giftCard.expires_at}
                businessName={giftCard.business.name}
                code={giftCard.code}
              />

              {/* How to use - Fun style */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mb-6 border border-slate-200/50">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Como usar seu vale-presente
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">1</span>
                    <span className="text-slate-700">Vá até <strong className="text-slate-900">{giftCard.business.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                    <span className="text-slate-700">Mostre o código <strong className="font-mono text-slate-900">{giftCard.code}</strong></span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                    <span className="text-slate-700">Aproveite! O saldo é descontado automaticamente 🎉</span>
                  </div>
                </div>
              </div>

              {/* Actions - More playful */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={`/api/gift-cards/${giftCard.id}/pdf`}
                  download
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </a>
                <Link
                  href={`/store/${slug}`}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
                >
                  <Gift className="w-4 h-4" />
                  Comprar outro
                </Link>
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  style={{ backgroundColor: giftCardColor }}
                >
                  <Home className="w-4 h-4" />
                  Meus presentes
                </Link>
              </div>

              {/* Email notice - friendlier */}
              <div className="text-center mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm text-emerald-700">
                  📨 Email de confirmação enviado para você{isGift ? ` e para ${giftCard.recipient_name}` : ''}!
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

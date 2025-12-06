// ============================================
// MIMOZ - Purchase Success Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Gift, Mail, Calendar, Sparkles, Share2, Home, User } from 'lucide-react';
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
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${giftCardColor}15 0%, white 50%, ${giftCardColor}10 100%)` }}>
      {/* Floating confetti/sparkles effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: `${giftCardColor}40` }} />
        <div className="absolute top-40 right-20 w-2 h-2 rounded-full animate-pulse delay-100" style={{ backgroundColor: `${giftCardColor}30` }} />
        <div className="absolute top-60 left-1/4 w-4 h-4 rounded-full animate-pulse delay-200" style={{ backgroundColor: `${giftCardColor}20` }} />
        <div className="absolute top-32 right-1/3 w-2 h-2 rounded-full animate-pulse delay-300" style={{ backgroundColor: `${giftCardColor}50` }} />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
      <main className="max-w-lg mx-auto px-4 py-8 sm:py-12 relative">
        {/* Success Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Pagamento confirmado
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {isGift ? '🎁 Presente enviado!' : '🎉 Vale-presente criado!'}
          </h2>
          <p className="text-slate-500">
            {isGift 
              ? `${giftCard.recipient_name} receberá um email com o código`
              : 'Guarde o código abaixo para usar na loja'
            }
          </p>
        </div>

        {/* Gift Card - Main Display */}
        <div className="relative mb-6">
          {/* Card shadow/glow effect */}
          <div 
            className="absolute inset-0 rounded-3xl blur-2xl opacity-30 transform translate-y-4"
            style={{ backgroundColor: giftCardColor }}
          />
          
          {/* The card itself */}
          <div 
            className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden"
            style={{ backgroundColor: giftCardColor }}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
            </div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    Vale-Presente
                  </div>
                  <p className="text-lg font-semibold">{giftCard.business.name}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
              </div>
              
              {/* Amount */}
              <div className="text-center py-4 sm:py-6">
                <p className="text-5xl sm:text-6xl font-bold tracking-tight">
                  {formatCurrency(giftCard.amount_cents)}
                </p>
                {giftCard.template?.name && (
                  <p className="text-white/60 text-sm mt-2">{giftCard.template.name}</p>
                )}
              </div>

              {/* Code Section */}
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Código</p>
                    <p className="text-xl sm:text-2xl font-mono font-bold tracking-widest truncate">
                      {giftCard.code}
                    </p>
                  </div>
                  <CopyCodeButton code={giftCard.code} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Destinatário</span>
            </div>
            <p className="font-semibold text-slate-900 truncate">{giftCard.recipient_name}</p>
            <p className="text-xs text-slate-500 truncate">{giftCard.recipient_email}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Validade</span>
            </div>
            <p className="font-semibold text-slate-900">
              {new Date(giftCard.expires_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500">
              {Math.ceil((new Date(giftCard.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
            </p>
          </div>
        </div>

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
      </main>

      {/* Footer */}
      <footer className="py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs">
            Powered by <span className="font-medium">Mimoz</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

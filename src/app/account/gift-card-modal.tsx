"use client";

// ============================================
// MIMOZ - Gift Card Modal Component
// ============================================
// Shows gift card in a popup for cashier scanning

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Gift, Sparkles, Copy, Check, Calendar, Store, Download, Heart, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface GiftCardModalProps {
  card: {
    id: string;
    code: string | null; // Can be null for security (gifts sent to others)
    amount_cents: number;
    balance_cents: number;
    status: string;
    expires_at: string;
    recipient_name: string;
    recipient_email?: string;
    recipient_message?: string;
    purchaser_name?: string;
    is_gift_for_other?: boolean; // Security flag
    // Custom card fields
    is_custom?: boolean;
    custom_title?: string | null;
    custom_emoji?: string | null;
    custom_bg_type?: 'color' | 'gradient' | 'image' | null;
    custom_bg_color?: string | null;
    custom_bg_gradient_start?: string | null;
    custom_bg_gradient_end?: string | null;
    custom_text_color?: string | null;
  };
  business: {
    name: string;
    slug: string;
  };
  template: {
    name: string;
    card_color?: string;
  } | null;
  type: 'purchased' | 'received';
  onClose: () => void;
}

export function GiftCardModal({ card, business, template, type, onClose }: GiftCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Trigger reveal animation
  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Determine colors based on whether it's a custom card or template
  const isCustom = card.is_custom;
  const cardColor = isCustom 
    ? (card.custom_bg_color || '#1e3a5f')
    : (template?.card_color || '#1e3a5f');
  const textColor = isCustom ? (card.custom_text_color || '#ffffff') : '#ffffff';
  
  const expiresAt = new Date(card.expires_at);
  const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining <= 0;
  const hasBalance = card.balance_cents > 0;

  const handleCopy = async () => {
    if (!card.code) return;
    try {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Check if this is a gift the purchaser sent to someone else (code should be hidden)
  const isGiftSentToOther = card.is_gift_for_other || !card.code;

  // Get background style for custom gradient cards
  const getBgStyle = () => {
    if (isCustom && card.custom_bg_type === 'gradient' && card.custom_bg_gradient_start && card.custom_bg_gradient_end) {
      return {
        background: `linear-gradient(to bottom right, ${card.custom_bg_gradient_start}, ${card.custom_bg_gradient_end})`,
      };
    }
    return { backgroundColor: cardColor };
  };

  // Get glow color
  const glowColor = isCustom && card.custom_bg_type === 'gradient' && card.custom_bg_gradient_start
    ? card.custom_bg_gradient_start
    : cardColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
          isRevealed ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md transition-all duration-500 ${
        isRevealed 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Card glow effect - animated */}
        <div 
          className={`absolute inset-0 rounded-3xl blur-3xl transition-all duration-700 ${
            isRevealed ? 'opacity-50 scale-110' : 'opacity-0 scale-100'
          }`}
          style={{ backgroundColor: glowColor }}
        />

        {/* Floating sparkles */}
        <div className="absolute -top-6 -right-6 text-3xl animate-sparkle" style={{ animationDelay: '0s' }}>✨</div>
        <div className="absolute -bottom-4 -left-4 text-2xl animate-sparkle" style={{ animationDelay: '0.5s' }}>🌟</div>

        {/* The Gift Card */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={getBgStyle()}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer opacity-20" />

          <div className="relative p-6 sm:p-8" style={{ color: textColor }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                {isCustom && card.custom_title ? (
                  <>
                    <p className="text-2xl sm:text-3xl font-bold mb-1">{card.custom_title}</p>
                    <p className="text-sm opacity-70">{business.name}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 opacity-60 text-xs uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      Vale-Presente
                    </div>
                    <p className="text-xl font-bold">{business.name}</p>
                    {template?.name && (
                      <p className="opacity-60 text-sm">{template.name}</p>
                    )}
                  </>
                )}
              </div>
              {isCustom && card.custom_emoji ? (
                <span className="text-5xl animate-bounce" style={{ animationDuration: '3s' }}>
                  {card.custom_emoji}
                </span>
              ) : (
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Gift className="w-7 h-7" />
                </div>
              )}
            </div>

            {/* Recipient name for received gifts */}
            {type === 'received' && card.recipient_name && (
              <div className="mb-4 flex items-center gap-2 text-sm opacity-80">
                <Heart className="w-4 h-4" />
                <span>Para: <strong>{card.recipient_name}</strong></span>
              </div>
            )}

            {/* Amount */}
            <div className="text-center py-6">
              {card.balance_cents !== card.amount_cents ? (
                <>
                  <p className="opacity-50 text-sm line-through mb-1">
                    {formatCurrency(card.amount_cents)}
                  </p>
                  <p className="text-6xl sm:text-7xl font-bold tracking-tight">
                    {formatCurrency(card.balance_cents)}
                  </p>
                  <p className="opacity-60 text-sm mt-2">Saldo disponível</p>
                </>
              ) : (
                <>
                  <p className="text-6xl sm:text-7xl font-bold tracking-tight">
                    {formatCurrency(card.amount_cents)}
                  </p>
                  <p className="opacity-60 text-sm mt-2">
                    {hasBalance ? 'Valor total' : 'Esgotado'}
                  </p>
                </>
              )}
            </div>

            {/* Gift message - PROMINENT for received gifts */}
            {type === 'received' && card.recipient_message && (
              <div className="mb-4 p-4 bg-white/15 backdrop-blur rounded-2xl border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {card.purchaser_name && (
                      <p className="text-xs opacity-60 mb-1 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Mensagem de {card.purchaser_name}
                      </p>
                    )}
                    <p className="italic text-base leading-relaxed">
                      "{card.recipient_message}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Code Section - Show code only if user is allowed to see it */}
            {isGiftSentToOther ? (
              // Gift sent to someone else - don't show code for security
              <div className="bg-white/15 backdrop-blur rounded-2xl p-5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <p className="text-lg font-semibold mb-2">Presente Enviado!</p>
                  <p className="opacity-70 text-sm mb-2">
                    Enviado para <strong>{card.recipient_name}</strong>
                  </p>
                  <p className="opacity-50 text-xs">
                    O código está disponível apenas para o destinatário
                  </p>
                </div>
              </div>
            ) : (
              // Show code for self-purchases or received gifts
              <div className="bg-white/15 backdrop-blur rounded-2xl p-5">
                <p className="opacity-50 text-xs uppercase tracking-wider text-center mb-3">
                  Apresente este código no caixa
                </p>
                <div className="flex items-center justify-center">
                  <p className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.15em] text-center">
                    {card.code}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium hover:scale-[1.02]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar código
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Sender info for received gifts (if no message) */}
            {type === 'received' && card.purchaser_name && !card.recipient_message && (
              <div className="mt-4 p-3 bg-white/10 rounded-xl text-center">
                <p className="text-sm opacity-80">
                  <Heart className="w-3 h-3 inline mr-1" />
                  Presente de <strong>{card.purchaser_name}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions - More prominent */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {/* Only show PDF download if user can see the code */}
          {!isGiftSentToOther && (
            <a
              href={`/api/gift-cards/${card.id}/pdf`}
              download
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-all text-sm font-medium hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </a>
          )}
          <a
            href={`/store/${business.slug}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-all text-sm font-medium hover:scale-105"
          >
            <Store className="w-4 h-4" />
            Loja
          </a>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that can be used in the list
interface GiftCardWithModalProps {
  card: any;
  userEmail: string | undefined;
  type: 'purchased' | 'received';
}

export function GiftCardWithModal({ card, userEmail, type }: GiftCardWithModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const template = card.gift_card_templates as { 
    name: string; 
    card_color?: string;
    businesses: { name: string; slug: string } 
  } | null;
  
  // Business info comes from the direct relation or from the template's businesses relation
  const business = card.businesses as { name: string; slug: string } | null
    || template?.businesses;
  
  const expiresAt = new Date(card.expires_at);
  const isExpired = expiresAt < new Date() && card.status === 'ACTIVE';
  const isGift = type === 'purchased' && card.recipient_email !== userEmail;
  
  // Get card color - for custom cards use custom_bg_color, otherwise template color
  const cardColor = card.is_custom 
    ? (card.custom_bg_color || '#1e3a5f')
    : (template?.card_color || '#1e3a5f');
  
  // Get glow color for gradient custom cards
  const glowColor = card.is_custom && card.custom_bg_type === 'gradient' && card.custom_bg_gradient_start
    ? card.custom_bg_gradient_start
    : cardColor;

  // Get background style
  const getBgStyle = () => {
    if (card.is_custom && card.custom_bg_type === 'gradient' && card.custom_bg_gradient_start && card.custom_bg_gradient_end) {
      return { background: `linear-gradient(135deg, ${card.custom_bg_gradient_start}, ${card.custom_bg_gradient_end})` };
    }
    return { backgroundColor: cardColor };
  };

  // Get text color
  const textColor = card.is_custom ? (card.custom_text_color || '#ffffff') : '#ffffff';
  
  // Check if card has balance
  const hasBalance = card.balance_cents > 0;
  const isUsed = card.balance_cents < card.amount_cents;

  // Check if there's a message to show
  const hasMessage = type === 'received' && card.recipient_message;

  return (
    <>
      <div 
        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-slate-200/50 hover:shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"
          style={{ backgroundColor: glowColor }}
        />
        
        {/* Card background */}
        <div 
          className="relative overflow-hidden"
          style={getBgStyle()}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
          </div>

          {/* Shimmer on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 animate-shimmer transition-opacity" />
          
          {/* Content */}
          <div className="relative p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                {card.is_custom && card.custom_emoji && (
                  <span className="text-3xl mb-2 block group-hover:animate-bounce" style={{ animationDuration: '2s' }}>
                    {card.custom_emoji}
                  </span>
                )}
                <h3 className="font-bold text-lg truncate" style={{ color: textColor }}>
                  {card.is_custom && card.custom_title ? card.custom_title : (business?.name || 'Vale-Presente')}
                </h3>
                <p className="text-sm truncate" style={{ color: `${textColor}99` }}>
                  {card.is_custom ? business?.name : (template?.name || 'Gift Card')}
                </p>
              </div>
              {!card.is_custom && (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${textColor}20` }}
                >
                  <Gift className="w-5 h-5" style={{ color: textColor }} />
                </div>
              )}
            </div>
            
            {/* Amount */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: textColor }}>
                  {formatCurrency(card.balance_cents)}
                </span>
                {isUsed && (
                  <span className="text-sm line-through" style={{ color: `${textColor}60` }}>
                    {formatCurrency(card.amount_cents)}
                  </span>
                )}
              </div>
              {!hasBalance && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-black/20" style={{ color: textColor }}>
                  Esgotado
                </span>
              )}
              {isExpired && hasBalance && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/80 text-white">
                  Expirado
                </span>
              )}
            </div>

            {/* Message preview for received gifts */}
            {hasMessage && (
              <div 
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: `${textColor}15` }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">💌</span>
                  <p 
                    className="italic line-clamp-2 opacity-90"
                    style={{ color: textColor }}
                  >
                    "{card.recipient_message}"
                  </p>
                </div>
                {card.purchaser_name && (
                  <p 
                    className="text-xs mt-1 opacity-60 text-right"
                    style={{ color: textColor }}
                  >
                    — {card.purchaser_name}
                  </p>
                )}
              </div>
            )}
            
            {/* Footer info */}
            <div 
              className="flex items-center justify-between pt-3 border-t"
              style={{ borderColor: `${textColor}20` }}
            >
              <div className="flex items-center gap-1 text-xs" style={{ color: `${textColor}80` }}>
                <Calendar className="w-3 h-3" />
                <span>Até {expiresAt.toLocaleDateString('pt-BR')}</span>
              </div>
              
              {/* Badges */}
              <div className="flex items-center gap-1">
                {type === 'received' && (
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: `${textColor}20`, color: textColor }}
                  >
                    🎁 Presente
                  </span>
                )}
                {isGift && (
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: `${textColor}20`, color: textColor }}
                  >
                    ✨ Enviado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar with business link */}
        <div className="bg-white/95 backdrop-blur px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Toque para abrir
          </span>
          {business && (
            <Link
              href={`/store/${business.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Store className="w-3 h-3" />
              Loja
            </Link>
          )}
        </div>
      </div>

      {/* Modal */}
      {isOpen && business && (
        <GiftCardModal
          card={card}
          business={business}
          template={template}
          type={type}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

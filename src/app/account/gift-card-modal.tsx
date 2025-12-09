"use client";

// ============================================
// MIMOZ - Gift Card Modal Component
// ============================================
// Shows gift card in a popup for cashier scanning

import { useState } from 'react';
import Link from 'next/link';
import { X, Gift, Sparkles, Copy, Check, Calendar, Store, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { GiftCardPreview } from '@/components/ui';

interface GiftCardModalProps {
  card: {
    id: string;
    code: string;
    amount_cents: number;
    balance_cents: number;
    status: string;
    expires_at: string;
    recipient_name: string;
    recipient_message?: string;
    purchaser_name?: string;
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
    try {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Card glow effect */}
        <div 
          className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
          style={{ backgroundColor: glowColor }}
        />

        {/* The Gift Card */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={getBgStyle()}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
          </div>

          <div className="relative p-8" style={{ color: textColor }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                {isCustom && card.custom_title ? (
                  <>
                    <p className="text-2xl font-bold mb-1">{card.custom_title}</p>
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
                <span className="text-4xl">{card.custom_emoji}</span>
              ) : (
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Gift className="w-7 h-7" />
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="text-center py-6">
              {card.balance_cents !== card.amount_cents ? (
                <>
                  <p className="opacity-50 text-sm line-through mb-1">
                    {formatCurrency(card.amount_cents)}
                  </p>
                  <p className="text-6xl font-bold tracking-tight">
                    {formatCurrency(card.balance_cents)}
                  </p>
                  <p className="opacity-60 text-sm mt-2">Saldo disponível</p>
                </>
              ) : (
                <>
                  <p className="text-6xl font-bold tracking-tight">
                    {formatCurrency(card.amount_cents)}
                  </p>
                  <p className="opacity-60 text-sm mt-2">
                    {hasBalance ? 'Valor total' : 'Esgotado'}
                  </p>
                </>
              )}
            </div>

            {/* Code Section - The main focus for cashier */}
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mt-4">
              <p className="opacity-50 text-xs uppercase tracking-wider text-center mb-3">
                Apresente este código no caixa
              </p>
              <div className="flex items-center justify-center gap-4">
                <p className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.2em] text-center">
                  {card.code}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
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

            {/* Gift message if received */}
            {type === 'received' && card.purchaser_name && (
              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <p className="opacity-60 text-xs mb-1">Presente de</p>
                <p className="font-medium">{card.purchaser_name}</p>
                {card.recipient_message && (
                  <p className="opacity-80 text-sm mt-2 italic">
                    &ldquo;{card.recipient_message}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <a
            href={`/api/gift-cards/${card.id}/pdf`}
            download
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </a>
          <a
            href={`/store/${business.slug}`}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white transition-colors text-sm"
          >
            <Store className="w-4 h-4" />
            Loja {business.name}
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
  
  // Business info comes from the direct relation (aliased as 'business')
  // or from the template's businesses relation for older cards
  const business = card.business as { name: string; slug: string } | null
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

  return (
    <>
      <div 
        className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Card Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ 
                  backgroundColor: cardColor,
                  background: card.is_custom && card.custom_bg_type === 'gradient' && card.custom_bg_gradient_start && card.custom_bg_gradient_end
                    ? `linear-gradient(to bottom right, ${card.custom_bg_gradient_start}, ${card.custom_bg_gradient_end})`
                    : undefined
                }}
              >
                {card.is_custom && card.custom_emoji ? (
                  <span className="text-2xl">{card.custom_emoji}</span>
                ) : (
                  <Gift className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {card.is_custom && card.custom_title ? card.custom_title : (business?.name || 'Vale-Presente')}
                </h3>
                <p className="text-sm text-slate-500">
                  {card.is_custom ? business?.name : (template?.name || 'Gift Card')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {type === 'received' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Presente recebido
                    </span>
                  )}
                  {isGift && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Enviado como presente
                    </span>
                  )}
                  {isExpired && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expirado
                    </span>
                  )}
                  {card.balance_cents === 0 && !isExpired && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Esgotado
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Recipient/Sender info */}
            {type === 'purchased' && isGift && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Para:</span> {card.recipient_name}
                </p>
                <p className="text-sm text-slate-500">{card.recipient_email}</p>
              </div>
            )}
            {type === 'received' && card.purchaser_name && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">De:</span> {card.purchaser_name}
                </p>
              </div>
            )}
          </div>
          
          {/* Value and hint */}
          <div className="text-right md:min-w-[140px]">
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(card.balance_cents)}
            </p>
            {card.balance_cents !== card.amount_cents && (
              <p className="text-sm text-slate-400 line-through">
                {formatCurrency(card.amount_cents)}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2 group-hover:text-slate-600 transition-colors">
              Clique para ver código
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(card.purchased_at).toLocaleDateString('pt-BR')}
            </span>
            <span>
              Válido até {expiresAt.toLocaleDateString('pt-BR')}
            </span>
          </div>
          {business && (
            <Link
              href={`/store/${business.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Store className="w-3 h-3" />
              Ir para a loja
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

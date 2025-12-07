'use client';

// ============================================
// MIMOZ - Gift Card Modal Component
// ============================================
// Shows gift card in a popup for cashier scanning

import { useState } from 'react';
import { X, Gift, Sparkles, Copy, Check, Calendar, Store } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  };
  business: {
    name: string;
    slug: string;
  };
  template: {
    name: string;
    card_color?: string;
  };
  type: 'purchased' | 'received';
  onClose: () => void;
}

export function GiftCardModal({ card, business, template, type, onClose }: GiftCardModalProps) {
  const [copied, setCopied] = useState(false);
  const cardColor = template.card_color || '#1e3a5f';
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
          style={{ backgroundColor: cardColor }}
        />

        {/* The Gift Card */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: cardColor }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
          </div>

          <div className="relative p-8 text-white">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  Vale-Presente
                </div>
                <p className="text-xl font-bold">{business.name}</p>
                <p className="text-white/60 text-sm">{template.name}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Gift className="w-7 h-7" />
              </div>
            </div>

            {/* Amount */}
            <div className="text-center py-6">
              {card.balance_cents !== card.amount_cents ? (
                <>
                  <p className="text-white/50 text-sm line-through mb-1">
                    {formatCurrency(card.amount_cents)}
                  </p>
                  <p className="text-6xl font-bold tracking-tight">
                    {formatCurrency(card.balance_cents)}
                  </p>
                  <p className="text-white/60 text-sm mt-2">Saldo disponível</p>
                </>
              ) : (
                <>
                  <p className="text-6xl font-bold tracking-tight">
                    {formatCurrency(card.amount_cents)}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    {hasBalance ? 'Valor total' : 'Esgotado'}
                  </p>
                </>
              )}
            </div>

            {/* Code Section - The main focus for cashier */}
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mt-4">
              <p className="text-white/50 text-xs uppercase tracking-wider text-center mb-3">
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

            {/* Status and expiry */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span>
                  {isExpired 
                    ? 'Expirado' 
                    : `${daysRemaining} dias restantes`
                  }
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                card.status === 'ACTIVE' && !isExpired
                  ? 'bg-green-500/20 text-green-200'
                  : card.status === 'REDEEMED'
                  ? 'bg-blue-500/20 text-blue-200'
                  : 'bg-white/10 text-white/60'
              }`}>
                {card.status === 'ACTIVE' && !isExpired ? 'Ativo' : 
                 card.status === 'REDEEMED' ? 'Resgatado' : 
                 isExpired ? 'Expirado' : card.status}
              </div>
            </div>

            {/* Gift message if received */}
            {type === 'received' && card.purchaser_name && (
              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <p className="text-white/60 text-xs mb-1">Presente de</p>
                <p className="font-medium">{card.purchaser_name}</p>
                {card.recipient_message && (
                  <p className="text-white/80 text-sm mt-2 italic">
                    "{card.recipient_message}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visit store link */}
        <a
          href={`/store/${business.slug}`}
          className="mt-4 flex items-center justify-center gap-2 py-3 text-white/80 hover:text-white transition-colors text-sm"
        >
          <Store className="w-4 h-4" />
          Visitar loja {business.name}
        </a>
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
  const business = template?.businesses;
  const expiresAt = new Date(card.expires_at);
  const isExpired = expiresAt < new Date() && card.status === 'ACTIVE';
  const isGift = type === 'purchased' && card.recipient_email !== userEmail;
  const cardColor = template?.card_color || '#1e3a5f';

  return (
    <>
      <div 
        className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Card Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: cardColor }}
              >
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {business?.name || 'Vale-Presente'}
                </h3>
                <p className="text-sm text-slate-500">
                  {template?.name || 'Gift Card'}
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
          <div className="text-right">
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(card.purchased_at).toLocaleDateString('pt-BR')}
            </span>
            <span>
              Válido até {expiresAt.toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && business && template && (
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

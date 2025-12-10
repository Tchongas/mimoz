'use client';

import { useState, useEffect } from 'react';
import { Gift, Sparkles, Copy, Check, PartyPopper } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface GiftCardDisplayProps {
  businessName: string;
  templateName?: string | null;
  amountCents: number;
  code: string;
  giftCardColor: string;
  recipientName?: string;
  recipientMessage?: string | null;
  senderName?: string | null;
  isGift?: boolean;
  // Custom card fields
  isCustom?: boolean;
  customTitle?: string | null;
  customEmoji?: string | null;
  customBgType?: 'color' | 'gradient' | 'image' | null;
  customBgColor?: string | null;
  customBgGradientStart?: string | null;
  customBgGradientEnd?: string | null;
  customTextColor?: string | null;
}

export function GiftCardDisplay({
  businessName,
  templateName,
  amountCents,
  code,
  giftCardColor,
  recipientName,
  recipientMessage,
  senderName,
  isGift,
  isCustom,
  customTitle,
  customEmoji,
  customBgType,
  customBgColor,
  customBgGradientStart,
  customBgGradientEnd,
  customTextColor,
}: GiftCardDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Trigger reveal animation after mount
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Determine colors
  const bgColor = isCustom ? (customBgColor || giftCardColor) : giftCardColor;
  const textColor = isCustom ? (customTextColor || '#ffffff') : '#ffffff';
  const glowColor = isCustom && customBgType === 'gradient' && customBgGradientStart
    ? customBgGradientStart
    : bgColor;

  // Get background style
  const getBgStyle = () => {
    if (isCustom && customBgType === 'gradient' && customBgGradientStart && customBgGradientEnd) {
      return { background: `linear-gradient(135deg, ${customBgGradientStart}, ${customBgGradientEnd})` };
    }
    return { backgroundColor: bgColor };
  };

  return (
    <div className="relative mb-8">
      {/* Animated glow effect */}
      <div
        className={`absolute inset-0 rounded-3xl blur-3xl transition-all duration-1000 ${
          isRevealed ? 'opacity-50 scale-105' : 'opacity-0 scale-95'
        }`}
        style={{ backgroundColor: glowColor }}
      />

      {/* Main card with reveal animation */}
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${
          isRevealed 
            ? 'opacity-100 translate-y-0 rotate-0' 
            : 'opacity-0 translate-y-8 -rotate-3'
        }`}
        style={getBgStyle()}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-30" />

        <div className="relative p-6 sm:p-8" style={{ color: textColor }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              {isCustom && customTitle ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold mb-1">{customTitle}</p>
                  <p className="text-sm opacity-70">{businessName}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 opacity-60 text-xs uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    Vale-Presente
                  </div>
                  <p className="text-xl font-bold">{businessName}</p>
                  {templateName && (
                    <p className="opacity-60 text-sm">{templateName}</p>
                  )}
                </>
              )}
            </div>
            {isCustom && customEmoji ? (
              <span className="text-5xl">
                {customEmoji}
              </span>
            ) : (
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Gift className="w-7 h-7" />
              </div>
            )}
          </div>

          {/* Amount - Big and bold */}
          <div className="text-center py-8">
            <p className="text-6xl sm:text-7xl font-bold tracking-tight">
              {formatCurrency(amountCents)}
            </p>
            {recipientName && (
              <p className="opacity-70 text-sm mt-3">
                Para: <span className="font-semibold">{recipientName}</span>
              </p>
            )}
          </div>

          {/* Personal message */}
          {recipientMessage && (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💌</span>
                <div>
                  {senderName && (
                    <p className="text-xs opacity-60 mb-1">Mensagem de {senderName}</p>
                  )}
                  <p className="italic opacity-90">"{recipientMessage}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Code Section */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5">
            <p className="opacity-50 text-xs uppercase tracking-wider text-center mb-3">
              Apresente este código no caixa
            </p>
            <div className="flex items-center justify-center">
              <p className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.15em] text-center">
                {code}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium"
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
        </div>
      </div>

    </div>
  );
}

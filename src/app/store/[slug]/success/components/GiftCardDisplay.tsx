'use client';

import { Gift, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CopyCodeButton } from '../copy-code-button';
import { GiftCardPreview } from '@/components/ui';

interface GiftCardDisplayProps {
  businessName: string;
  templateName?: string | null;
  amountCents: number;
  code: string;
  giftCardColor: string;
  recipientName?: string;
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
  isCustom,
  customTitle,
  customEmoji,
  customBgType,
  customBgColor,
  customBgGradientStart,
  customBgGradientEnd,
  customTextColor,
}: GiftCardDisplayProps) {
  // For custom cards, use the shared GiftCardPreview component
  if (isCustom) {
    const bgColor = customBgColor || giftCardColor;
    const textColor = customTextColor || '#ffffff';
    
    return (
      <div className="relative mb-6">
        {/* Glow effect */}
        <div
          className="absolute inset-4 rounded-3xl blur-3xl opacity-40"
          style={{ 
            backgroundColor: customBgType === 'gradient' && customBgGradientStart 
              ? customBgGradientStart 
              : bgColor 
          }}
        />

        {/* Card Preview */}
        <GiftCardPreview
          title={customTitle || undefined}
          emoji={customEmoji || undefined}
          amount={amountCents}
          businessName={businessName}
          recipientName={recipientName}
          bgType={customBgType || 'color'}
          bgColor={bgColor}
          bgGradientStart={customBgGradientStart || undefined}
          bgGradientEnd={customBgGradientEnd || undefined}
          bgGradientDirection="to-br"
          textColor={textColor}
          size="lg"
          showMessage={false}
        />

        {/* Code Section */}
        <div 
          className="relative -mt-4 mx-4 rounded-2xl p-4 backdrop-blur shadow-lg"
          style={{ 
            backgroundColor: customBgType === 'gradient' && customBgGradientEnd 
              ? `${customBgGradientEnd}ee` 
              : `${bgColor}ee` 
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: `${textColor}80` }}>
                Código
              </p>
              <p 
                className="text-xl sm:text-2xl font-mono font-bold tracking-widest truncate"
                style={{ color: textColor }}
              >
                {code}
              </p>
            </div>
            <CopyCodeButton code={code} />
          </div>
        </div>
      </div>
    );
  }

  // Standard template card display
  return (
    <div className="relative mb-6">
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-30 transform translate-y-4"
        style={{ backgroundColor: giftCardColor }}
      />

      <div
        className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl"
        style={{ backgroundColor: giftCardColor }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                Vale-Presente
              </div>
              <p className="text-lg font-semibold">{businessName}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
          </div>

          <div className="text-center py-4 sm:py-6">
            <p className="text-5xl sm:text-6xl font-bold tracking-tight">
              {formatCurrency(amountCents)}
            </p>
            {templateName && (
              <p className="text-white/60 text-sm mt-2">{templateName}</p>
            )}
          </div>

          <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Código</p>
                <p className="text-xl sm:text-2xl font-mono font-bold tracking-widest truncate">
                  {code}
                </p>
              </div>
              <CopyCodeButton code={code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

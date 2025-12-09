'use client';

// ============================================
// MIMOZ - Shared Gift Card Preview Component
// Giftly-inspired design with title as main focus
// ============================================

import { Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface GiftCardPreviewProps {
  // Content
  title?: string;
  emoji?: string;
  amount: number;
  businessName: string;
  recipientName?: string;
  message?: string;
  senderName?: string;
  
  // Styling
  bgType?: 'color' | 'gradient' | 'image';
  bgColor?: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  bgGradientDirection?: string;
  bgImageUrl?: string;
  textColor?: string;
  
  // Display options
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  isAnimating?: boolean;
  className?: string;
}

// Popular emojis for gift cards
export const GIFT_CARD_EMOJIS = [
  '🎁', '🎉', '🎂', '💝', '🌟', '✨', '🎊', '💐', 
  '🌹', '🎈', '💖', '🥳', '🍾', '🎄', '🎃', '💕',
  '🌸', '🌺', '🎀', '💫', '⭐', '🌈', '🦋', '🍀'
];

export function GiftCardPreview({
  title,
  emoji,
  amount,
  businessName,
  recipientName,
  message,
  senderName,
  bgType = 'gradient',
  bgColor = '#6366f1',
  bgGradientStart = '#6366f1',
  bgGradientEnd = '#8b5cf6',
  bgGradientDirection = 'to-br',
  bgImageUrl,
  textColor = '#ffffff',
  size = 'md',
  showMessage = true,
  isAnimating = false,
  className = '',
}: GiftCardPreviewProps) {
  // Get background style
  const getBgStyle = () => {
    if (bgType === 'gradient' && bgGradientStart && bgGradientEnd) {
      const direction = bgGradientDirection === 'to-r' ? 'to right' : 
                       bgGradientDirection === 'to-br' ? 'to bottom right' : 
                       bgGradientDirection === 'to-b' ? 'to bottom' : 'to bottom right';
      return {
        background: `linear-gradient(${direction}, ${bgGradientStart}, ${bgGradientEnd})`,
      };
    }
    
    if (bgType === 'image' && bgImageUrl) {
      return {
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    return { backgroundColor: bgColor };
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      card: 'aspect-[1.6/1] rounded-2xl',
      padding: 'p-4',
      emoji: 'text-3xl',
      title: 'text-xl sm:text-2xl',
      amount: 'text-sm',
      business: 'text-xs',
      recipient: 'text-xs',
    },
    md: {
      card: 'aspect-[1.6/1] rounded-3xl',
      padding: 'p-5 sm:p-6',
      emoji: 'text-4xl sm:text-5xl',
      title: 'text-2xl sm:text-3xl md:text-4xl',
      amount: 'text-sm sm:text-base',
      business: 'text-xs sm:text-sm',
      recipient: 'text-xs sm:text-sm',
    },
    lg: {
      card: 'aspect-[1.6/1] rounded-3xl',
      padding: 'p-6 sm:p-8',
      emoji: 'text-5xl sm:text-6xl',
      title: 'text-3xl sm:text-4xl md:text-5xl',
      amount: 'text-base sm:text-lg',
      business: 'text-sm',
      recipient: 'text-sm',
    },
  };

  const config = sizeConfig[size];
  const displayTitle = title || 'Vale-Presente';

  return (
    <div className={className}>
      {/* Card */}
      <div 
        className={`relative overflow-hidden shadow-2xl transition-all duration-300 ${config.card} ${
          isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
        }`}
        style={getBgStyle()}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Content */}
        <div className={`relative h-full flex flex-col justify-between ${config.padding}`}>
          {/* Top right: Emoji */}
          {emoji && (
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
              <span className={`${config.emoji} drop-shadow-lg`}>{emoji}</span>
            </div>
          )}
          
          {/* Top left: Business name (subtle) */}
          <div className="flex items-start justify-between">
            <p 
              className={`${config.business} font-medium opacity-70`}
              style={{ color: textColor }}
            >
              {businessName}
            </p>
          </div>
          
          {/* Center/Main: Title - THE STAR OF THE SHOW */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <h3 
              className={`${config.title} font-bold leading-tight tracking-tight`}
              style={{ 
                color: textColor,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              {displayTitle}
            </h3>
          </div>
          
          {/* Bottom: Amount and recipient */}
          <div className="flex items-end justify-between">
            <div>
              {recipientName && (
                <p 
                  className={`${config.recipient} opacity-70 mb-0.5`}
                  style={{ color: textColor }}
                >
                  Para {recipientName}
                </p>
              )}
              <p 
                className={`${config.amount} font-semibold`}
                style={{ color: textColor }}
              >
                {formatCurrency(amount)}
              </p>
            </div>
            
            {/* Gift icon */}
            <Gift 
              className="w-6 h-6 sm:w-8 sm:h-8 opacity-30" 
              style={{ color: textColor }} 
            />
          </div>
        </div>
      </div>

      {/* Message (optional, shown below card) */}
      {showMessage && message && (
        <div className="mt-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-slate-200/50 shadow-sm">
          <p className="text-slate-700 italic text-sm sm:text-base">&ldquo;{message}&rdquo;</p>
          {senderName && (
            <p className="text-slate-500 text-xs sm:text-sm mt-2">— {senderName}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default GiftCardPreview;

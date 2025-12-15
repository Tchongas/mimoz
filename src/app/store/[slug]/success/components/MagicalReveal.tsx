'use client';

// ============================================
// Tapresente - Magical Card Reveal Animation
// Giftly-inspired opening animation with confetti
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Sparkles, PartyPopper } from 'lucide-react';

interface MagicalRevealProps {
  children: React.ReactNode;
  onRevealComplete?: () => void;
}

// Confetti particle component
function ConfettiParticle({ 
  color, 
  delay, 
  left, 
  size 
}: { 
  color: string; 
  delay: number; 
  left: number;
  size: number;
}) {
  return (
    <div
      className="absolute animate-confetti-fall pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-20px',
        animationDelay: `${delay}s`,
        width: size,
        height: size,
      }}
    >
      <div
        className="w-full h-full rounded-sm animate-confetti-spin"
        style={{ 
          backgroundColor: color,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}

export function MagicalReveal({ children, onRevealComplete }: MagicalRevealProps) {
  const [phase, setPhase] = useState<'envelope' | 'opening' | 'revealed'>('envelope');
  const [showConfetti, setShowConfetti] = useState(false);
  const hasAutoOpened = useRef(false);

  // Auto-open after a short delay for better UX
  useEffect(() => {
    if (hasAutoOpened.current) return;
    hasAutoOpened.current = true;
    
    const timer = setTimeout(() => {
      handleOpen();
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    if (phase !== 'envelope') return;
    
    setPhase('opening');
    setShowConfetti(true);
    
    // Transition to revealed state
    setTimeout(() => {
      setPhase('revealed');
      onRevealComplete?.();
    }, 600);
    
    // Stop confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Confetti colors
  const confettiColors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', 
    '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
    '#FFB347', '#87CEEB', '#98D8C8', '#F7DC6F'
  ];

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    delay: Math.random() * 0.5,
    left: Math.random() * 100,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="relative">
      {/* Confetti container */}
      {showConfetti && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
          {confettiParticles.map((particle) => (
            <ConfettiParticle
              key={particle.id}
              color={particle.color}
              delay={particle.delay}
              left={particle.left}
              size={particle.size}
            />
          ))}
        </div>
      )}

      {/* Envelope phase */}
      {phase === 'envelope' && (
        <div 
          className="cursor-pointer group"
          onClick={handleOpen}
        >
          {/* Envelope container */}
          <div className="relative mx-auto max-w-sm">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            
            {/* Envelope body */}
            <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              {/* Envelope flap */}
              <div className="absolute -top-1 left-0 right-0 h-24 overflow-hidden">
                <div 
                  className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-amber-200 to-orange-200 origin-bottom transform group-hover:-rotate-6 transition-transform duration-300"
                  style={{
                    clipPath: 'polygon(0 100%, 50% 30%, 100% 100%)',
                  }}
                />
              </div>
              
              {/* Envelope seal */}
              <div className="relative z-10 flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <p className="mt-6 text-lg font-semibold text-amber-900">Você tem um presente!</p>
                <p className="mt-2 text-sm text-amber-700 animate-pulse">Toque para abrir</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opening animation */}
      {phase === 'opening' && (
        <div className="relative animate-envelope-open">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            {children}
          </div>
        </div>
      )}

      {/* Revealed state */}
      {phase === 'revealed' && (
        <div className="animate-in fade-in-0 zoom-in-95 duration-500">
          {children}
        </div>
      )}
    </div>
  );
}

// Celebration header with animated elements
export function CelebrationHeader({ 
  isGift, 
  recipientName,
  senderName,
}: { 
  isGift: boolean; 
  recipientName: string | null;
  senderName?: string | null;
}) {
  return (
    <div className="text-center mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      {/* Animated celebration icon */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Pulsing rings */}
        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 animate-ping opacity-40" />
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 animate-pulse opacity-60" />
        
        {/* Main badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
            <PartyPopper className="w-10 h-10 text-white animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          
          {/* Sparkle decorations */}
          <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
          <div className="absolute -bottom-1 -left-3 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>🎊</div>
        </div>
      </div>

      {/* Title */}
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
      
      {/* Subtitle */}
      <p className="text-slate-600 text-lg">
        {isGift ? (
          <>
            <span className="font-semibold text-purple-600">{recipientName || 'O destinatário'}</span>
            {' '}vai adorar esse presente!
          </>
        ) : (
          'Seu vale-presente está pronto para usar!'
        )}
      </p>
      
      {/* Sender info for gifts */}
      {isGift && senderName && (
        <p className="mt-2 text-sm text-slate-500">
          Enviado com carinho por você 💝
        </p>
      )}
    </div>
  );
}

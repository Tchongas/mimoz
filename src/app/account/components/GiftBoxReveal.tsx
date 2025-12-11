'use client';

// ============================================
// MIMOZ - Gift Box Reveal Animation
// ============================================
// A fun animation for opening received gift cards

import { useState, useEffect, useMemo } from 'react';

interface GiftBoxRevealProps {
  onRevealComplete: () => void;
  cardColor: string;
}

export function GiftBoxReveal({ onRevealComplete, cardColor }: GiftBoxRevealProps) {
  const [phase, setPhase] = useState<'idle' | 'shake' | 'explode' | 'done'>('idle');

  useEffect(() => {
    // Start shake after a brief moment
    const shakeTimer = setTimeout(() => setPhase('shake'), 200);
    
    // Explode after shaking
    const explodeTimer = setTimeout(() => setPhase('explode'), 1200);
    
    // Complete after explosion
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onRevealComplete();
    }, 2000);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [onRevealComplete]);

  // Generate confetti particles with pre-calculated positions (memoized)
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];
  const confettiPieces = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15) * (Math.PI / 180);
    const distance = 80 + (i % 3) * 30; // Deterministic spread
    return {
      id: i,
      color: confettiColors[i % confettiColors.length],
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      size: 8 + (i % 4) * 3,
      delay: (i % 5) * 0.05,
      rotation: (i * 30) % 360,
    };
  }), []);

  // Generate sparkles with pre-calculated positions (memoized)
  const sparkles = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45) * (Math.PI / 180);
    const distance = 70 + (i % 2) * 20;
    return {
      id: i,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      delay: (i % 3) * 0.1,
      size: 18 + (i % 3) * 4,
    };
  }), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-70'
        }`}
      />

      {/* Gift Box Container */}
      <div className={`relative transition-all duration-300 ${phase === 'done' ? 'opacity-0 scale-0' : ''}`}>
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-3xl blur-3xl transition-all duration-500 ${
            phase === 'explode' ? 'opacity-80 scale-150' : 'opacity-40'
          }`}
          style={{ backgroundColor: cardColor }}
        />

        {/* Confetti particles - only show during explode */}
        {phase === 'explode' && confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute left-1/2 top-1/2 animate-confetti-burst"
            style={{
              '--tx': `${piece.tx}px`,
              '--ty': `${piece.ty}px`,
              animationDelay: `${piece.delay}s`,
            } as React.CSSProperties}
          >
            <div
              className="animate-confetti-spin"
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.id % 2 === 0 ? '50%' : '2px',
                transform: `rotate(${piece.rotation}deg)`,
              }}
            />
          </div>
        ))}

        {/* Sparkle emojis - only show during explode */}
        {phase === 'explode' && sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute left-1/2 top-1/2 animate-sparkle-burst"
            style={{
              '--tx': `${sparkle.tx}px`,
              '--ty': `${sparkle.ty}px`,
              animationDelay: `${sparkle.delay}s`,
              fontSize: sparkle.size,
            } as React.CSSProperties}
          >
            ✨
          </div>
        ))}

        {/* The Gift Box */}
        <div 
          className={`relative transition-all duration-300 ${
            phase === 'shake' ? 'animate-gift-shake' : ''
          } ${phase === 'explode' ? 'scale-0 opacity-0' : ''}`}
        >
          {/* Box body */}
          <div 
            className="w-32 h-28 rounded-xl relative overflow-hidden shadow-2xl"
            style={{ backgroundColor: cardColor }}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-white rounded-full" />
            </div>
            
            {/* Vertical ribbon */}
            <div className="absolute left-1/2 -translate-x-1/2 w-6 h-full bg-white/30" />
            
            {/* Horizontal ribbon */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-6 bg-white/30" />
          </div>

          {/* Box lid */}
          <div 
            className={`absolute -top-4 left-1/2 -translate-x-1/2 w-36 h-8 rounded-t-xl shadow-lg transition-transform duration-300 origin-bottom ${
              phase === 'shake' ? 'animate-lid-wobble' : ''
            }`}
            style={{ backgroundColor: cardColor }}
          >
            {/* Lid ribbon */}
            <div className="absolute left-1/2 -translate-x-1/2 w-6 h-full bg-white/30" />
            
            {/* Bow */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="relative">
                {/* Bow loops */}
                <div 
                  className="absolute -left-5 top-1 w-6 h-4 rounded-full border-4 rotate-[-30deg]"
                  style={{ borderColor: 'rgba(255,255,255,0.5)' }}
                />
                <div 
                  className="absolute -right-5 top-1 w-6 h-4 rounded-full border-4 rotate-[30deg]"
                  style={{ borderColor: 'rgba(255,255,255,0.5)' }}
                />
                {/* Bow center */}
                <div className="w-4 h-4 rounded-full bg-white/50" />
              </div>
            </div>
          </div>

          {/* Gift emoji floating above */}
          <div className={`absolute -top-16 left-1/2 -translate-x-1/2 text-4xl transition-all duration-300 ${
            phase === 'shake' ? 'animate-bounce' : ''
          }`}>
            🎁
          </div>
        </div>

        {/* "Tap to open" hint */}
        {phase === 'idle' && (
          <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-sm whitespace-nowrap animate-pulse">
            Abrindo seu presente...
          </p>
        )}

        {/* Celebration text during explode */}
        {phase === 'explode' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-2xl font-bold animate-scale-in">
              🎉 Surpresa! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

// ============================================
// Tapresente - Success Confetti Animation
// Celebratory confetti burst on purchase success
// ============================================

import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', 
  '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
  '#FFB347', '#87CEEB', '#98D8C8', '#F7DC6F',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3'
];

export function SuccessConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate confetti pieces
    const confetti: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));
    
    setPieces(confetti);

    // Hide confetti after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${2.5 + Math.random()}s`,
          }}
        >
          <div
            className="animate-confetti-spin"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        </div>
      ))}
      
      {/* Extra sparkle emojis */}
      <div className="absolute top-20 left-1/4 text-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>🎊</div>
      <div className="absolute top-32 right-1/4 text-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>✨</div>
      <div className="absolute top-16 right-1/3 text-3xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>🎉</div>
      <div className="absolute top-24 left-1/3 text-2xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>⭐</div>
    </div>
  );
}

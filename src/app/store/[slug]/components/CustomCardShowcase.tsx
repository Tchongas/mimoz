'use client';

// ============================================
// Tapresente - Custom Card Showcase Component
// ============================================
// A magical, interactive preview of custom gift cards on the store page

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Heart, 
  PartyPopper,
  ChevronRight,
  Palette,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { GiftCardPreview, GIFT_CARD_EMOJIS } from '@/components/ui';

interface CustomCardShowcaseProps {
  businessSlug: string;
  businessName: string;
  sectionTitle: string;
  sectionSubtitle: string;
  accentColor: string;
  presetAmounts: number[];
  minAmount: number;
  maxAmount: number;
}

// Preset backgrounds for the showcase
const SHOWCASE_BACKGROUNDS = [
  { id: 'ocean', name: 'Oceano', type: 'gradient', start: '#0ea5e9', end: '#6366f1', textColor: '#ffffff' },
  { id: 'sunset', name: 'Pôr do Sol', type: 'gradient', start: '#f97316', end: '#ec4899', textColor: '#ffffff' },
  { id: 'aurora', name: 'Aurora', type: 'gradient', start: '#8b5cf6', end: '#ec4899', textColor: '#ffffff' },
  { id: 'forest', name: 'Floresta', type: 'gradient', start: '#059669', end: '#0d9488', textColor: '#ffffff' },
  { id: 'night', name: 'Noite', type: 'gradient', start: '#1e293b', end: '#475569', textColor: '#ffffff' },
  { id: 'love', name: 'Amor', type: 'gradient', start: '#ec4899', end: '#f43f5e', textColor: '#ffffff' },
  { id: 'gold', name: 'Dourado', type: 'color', color: '#b45309', textColor: '#ffffff' },
  { id: 'royal', name: 'Real', type: 'gradient', start: '#6d28d9', end: '#4f46e5', textColor: '#ffffff' },
];

// Preset titles for the showcase (title + emoji separated)
const SHOWCASE_TITLES = [
  { title: 'Feliz Aniversário!', emoji: '🎂' },
  { title: 'Com Amor', emoji: '❤️' },
  { title: 'Parabéns!', emoji: '🎉' },
  { title: 'Para Você', emoji: '✨' },
  { title: 'Obrigado!', emoji: '💝' },
  { title: 'Boas Festas!', emoji: '🎄' },
];

export function CustomCardShowcase({
  businessSlug,
  businessName,
  sectionTitle,
  sectionSubtitle,
  accentColor,
  presetAmounts,
  minAmount,
  maxAmount,
}: CustomCardShowcaseProps) {
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(presetAmounts[2] || 10000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [titleIndex, setTitleIndex] = useState(0);

  // Auto-rotate backgrounds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setSelectedBgIndex((prev) => (prev + 1) % SHOWCASE_BACKGROUNDS.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate titles
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % SHOWCASE_TITLES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentBg = SHOWCASE_BACKGROUNDS[selectedBgIndex];
  const currentTitleData = SHOWCASE_TITLES[titleIndex];

  const getBgStyle = () => {
    if (currentBg.type === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${currentBg.start}, ${currentBg.end})`,
      };
    }
    return { backgroundColor: currentBg.color };
  };

  const handleBgSelect = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedBgIndex(index);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Animated background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-10"
        style={getBgStyle()}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-violet-400/30 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-400/30 rounded-full animate-float-delayed" />
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-indigo-400/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-5 h-5 bg-amber-400/30 rounded-full animate-float-delayed" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            {sectionTitle}
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Interactive Card Preview - ON TOP for mobile */}
          <div className="order-1 lg:order-1">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              {/* Glow effect behind card */}
              <div 
                className="absolute inset-4 blur-3xl opacity-40 transition-all duration-1000"
                style={getBgStyle()}
              />
              
              {/* Card using shared component */}
              <div 
                className="relative cursor-pointer"
                onClick={() => handleBgSelect((selectedBgIndex + 1) % SHOWCASE_BACKGROUNDS.length)}
              >
                <GiftCardPreview
                  title={currentTitleData.title}
                  emoji={currentTitleData.emoji}
                  amount={selectedAmount}
                  businessName={businessName}
                  recipientName="Alguém Especial"
                  bgType={currentBg.type as 'color' | 'gradient'}
                  bgColor={currentBg.color}
                  bgGradientStart={currentBg.start}
                  bgGradientEnd={currentBg.end}
                  bgGradientDirection="to-br"
                  textColor={currentBg.textColor}
                  size="lg"
                  showMessage={false}
                  isAnimating={isAnimating}
                />
              </div>

              {/* Click hint */}
              <p className="text-center text-sm text-slate-500 mt-4">
                Clique no cartão para ver mais estilos ✨
              </p>
            </div>
          </div>

          {/* Right side: Features & CTA */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Background selector */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Escolha um estilo
              </p>
              <div className="flex flex-wrap gap-2">
                {SHOWCASE_BACKGROUNDS.map((bg, index) => (
                  <button
                    key={bg.id}
                    onClick={() => handleBgSelect(index)}
                    className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                      selectedBgIndex === index 
                        ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={
                      bg.type === 'gradient'
                        ? { background: `linear-gradient(135deg, ${bg.start}, ${bg.end})` }
                        : { backgroundColor: bg.color }
                    }
                    title={bg.name}
                  />
                ))}
              </div>
            </div>

            {/* Amount selector */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Valores populares</p>
              <div className="flex flex-wrap gap-2">
                {presetAmounts.slice(0, 6).map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      selectedAmount === amount
                        ? 'text-white scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    style={selectedAmount === amount ? { backgroundColor: accentColor } : {}}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <span>Personalize cores e estilos</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-600" />
                </div>
                <span>Adicione uma mensagem especial</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <PartyPopper className="w-4 h-4 text-amber-600" />
                </div>
                <span>Escolha qualquer valor de {formatCurrency(minAmount)} a {formatCurrency(maxAmount)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href={`/store/${businessSlug}/custom`}
              className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-5 h-5" />
              Criar Meu Vale-Presente
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}

'use client';

// ============================================
// MIMOZ - Custom Gift Card Builder Component
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Gift, 
  Palette, 
  MessageSquare, 
  User, 
  Mail, 
  DollarSign,
  Sparkles,
  Check,
  Loader2,
  LogIn,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CardBackground } from '@/types/gift-cards';

interface CustomCardBuilderProps {
  businessId: string;
  businessName: string;
  businessSlug: string;
  primaryColor: string;
  secondaryColor: string;
  defaultCardColor: string;
  backgrounds: {
    default: CardBackground[];
    business: CardBackground[];
  };
  settings: {
    minAmount: number;
    maxAmount: number;
    presetAmounts: number[];
    allowCustomAmount: boolean;
    sectionTitle: string;
    sectionSubtitle: string;
  };
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  returnUrl: string;
}

export function CustomCardBuilder({
  businessId,
  businessName,
  businessSlug,
  primaryColor,
  secondaryColor,
  defaultCardColor,
  backgrounds,
  settings,
  isAuthenticated,
  userName,
  userEmail,
  returnUrl,
}: CustomCardBuilderProps) {
  const router = useRouter();
  
  // Form state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Card customization
  const [selectedAmount, setSelectedAmount] = useState<number>(settings.presetAmounts[2] || 10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  
  // Design
  const [selectedBg, setSelectedBg] = useState<CardBackground | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // Recipient
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  // Set default background on mount
  useEffect(() => {
    const allBgs = [...backgrounds.business, ...backgrounds.default];
    if (allBgs.length > 0 && !selectedBg) {
      setSelectedBg(allBgs[0]);
    }
  }, [backgrounds, selectedBg]);

  // Calculate actual amount
  const actualAmount = useCustomAmount 
    ? Math.round(parseFloat(customAmount || '0') * 100) 
    : selectedAmount;

  // Get background style
  const getBgStyle = (bg: CardBackground | null) => {
    if (!bg) return { backgroundColor: defaultCardColor };
    
    if (bg.type === 'gradient') {
      const direction = bg.gradient_direction === 'to-r' ? 'to right' : 
                       bg.gradient_direction === 'to-br' ? 'to bottom right' : 'to bottom';
      return {
        background: `linear-gradient(${direction}, ${bg.gradient_start}, ${bg.gradient_end})`,
      };
    }
    
    if (bg.type === 'image' && bg.image_url) {
      return {
        backgroundImage: `url(${bg.image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    return { backgroundColor: bg.color || defaultCardColor };
  };

  const textColor = selectedBg?.text_color || '#ffffff';

  // Handle checkout
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!recipientName || !recipientEmail) {
      setError('Preencha o nome e email do destinatário');
      return;
    }

    if (actualAmount < settings.minAmount || actualAmount > settings.maxAmount) {
      setError(`Valor deve estar entre ${formatCurrency(settings.minAmount)} e ${formatCurrency(settings.maxAmount)}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/store/custom-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          amountCents: actualAmount,
          customTitle: customTitle || undefined,
          bgType: selectedBg?.type || 'color',
          bgColor: selectedBg?.color || defaultCardColor,
          bgGradientStart: selectedBg?.gradient_start,
          bgGradientEnd: selectedBg?.gradient_end,
          bgImageUrl: selectedBg?.image_url,
          textColor,
          recipientName,
          recipientEmail,
          recipientMessage: message || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar compra');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.devMode && data.giftCardCode) {
        router.push(`/store/${businessSlug}/success?code=${data.giftCardCode}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar compra');
    } finally {
      setIsLoading(false);
    }
  };

  // All backgrounds combined
  const allBackgrounds = [...backgrounds.business, ...backgrounds.default];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Card Preview */}
      <div className="order-2 lg:order-1">
        <div className="sticky top-24">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Prévia do Vale-Presente</h3>
          
          {/* Card Preview */}
          <div 
            className="aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl relative"
            style={getBgStyle(selectedBg)}
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
              {/* Top: Title */}
              <div>
                {customTitle ? (
                  <h4 className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
                    {customTitle}
                  </h4>
                ) : (
                  <p className="text-sm opacity-70" style={{ color: textColor }}>
                    Vale-Presente
                  </p>
                )}
              </div>
              
              {/* Center: Amount */}
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold" style={{ color: textColor }}>
                  {formatCurrency(actualAmount)}
                </p>
                <p className="text-sm mt-2 opacity-70" style={{ color: textColor }}>
                  {businessName}
                </p>
              </div>
              
              {/* Bottom: Recipient */}
              <div className="flex justify-between items-end">
                <div>
                  {recipientName && (
                    <>
                      <p className="text-xs opacity-60" style={{ color: textColor }}>Para</p>
                      <p className="font-medium" style={{ color: textColor }}>{recipientName}</p>
                    </>
                  )}
                </div>
                <Gift className="w-8 h-8 opacity-30" style={{ color: textColor }} />
              </div>
            </div>
          </div>

          {/* Message Preview */}
          {message && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Mensagem:</p>
              <p className="text-slate-700 italic">"{message}"</p>
              {userName && (
                <p className="text-sm text-slate-500 mt-2">— {userName}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Builder Form */}
      <div className="order-1 lg:order-2 space-y-6">
        {/* Step 1: Amount */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Escolha o Valor</h3>
          </div>
          
          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {settings.presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setUseCustomAmount(false);
                }}
                className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                  !useCustomAmount && selectedAmount === amount
                    ? 'ring-2 ring-offset-2 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={
                  !useCustomAmount && selectedAmount === amount
                    ? { backgroundColor: secondaryColor }
                    : {}
                }
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
          
          {/* Custom amount */}
          {settings.allowCustomAmount && (
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <input
                  type="checkbox"
                  checked={useCustomAmount}
                  onChange={(e) => setUseCustomAmount(e.target.checked)}
                  className="rounded"
                />
                Valor personalizado
              </label>
              {useCustomAmount && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0,00"
                    min={settings.minAmount / 100}
                    max={settings.maxAmount / 100}
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Mín: {formatCurrency(settings.minAmount)} • Máx: {formatCurrency(settings.maxAmount)}
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Design */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Personalize o Design</h3>
          </div>
          
          {/* Background selection */}
          <p className="text-sm text-slate-600 mb-3">Escolha um fundo:</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
            {allBackgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg)}
                className={`aspect-square rounded-lg overflow-hidden relative transition-all ${
                  selectedBg?.id === bg.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'hover:scale-105'
                }`}
                style={getBgStyle(bg)}
                title={bg.name}
              >
                {selectedBg?.id === bg.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Custom title */}
          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">
              Título personalizado (opcional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Ex: Feliz Aniversário! 🎂"
              maxLength={100}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Step 3: Message & Recipient */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Destinatário e Mensagem</h3>
          </div>
          
          <div className="space-y-4">
            {/* Recipient name */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Nome do destinatário *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Para quem é o presente?"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            {/* Recipient email */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Email do destinatário *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            {/* Message */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Mensagem pessoal (opcional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva uma mensagem especial..."
                  maxLength={500}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{message.length}/500 caracteres</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Checkout */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600">Total:</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(actualAmount)}
            </span>
          </div>
          
          {isAuthenticated ? (
            <button
              onClick={handleCheckout}
              disabled={isLoading || actualAmount < settings.minAmount}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: secondaryColor }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Criar Vale-Presente
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(returnUrl)}`}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 hover:opacity-90"
              style={{ backgroundColor: secondaryColor }}
            >
              <LogIn className="w-5 h-5" />
              Entrar para Continuar
            </Link>
          )}
          
          <p className="text-xs text-slate-500 text-center mt-3">
            Pagamento seguro via PIX
          </p>
        </div>
      </div>
    </div>
  );
}

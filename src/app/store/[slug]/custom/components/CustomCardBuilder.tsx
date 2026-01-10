'use client';

// ============================================
// Tapresente - Custom Gift Card Builder Component
// Tabbed interface with shared GiftCardPreview
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
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
  CreditCard,
  Send,
  Gift,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { GiftCardPreview, GIFT_CARD_EMOJIS } from '@/components/ui';
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
  
  // Tab state for mobile-friendly interface
  const [activeTab, setActiveTab] = useState<'design' | 'amount' | 'recipient'>('design');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Card customization
  const [selectedAmount, setSelectedAmount] = useState<number>(settings.presetAmounts[2] || 10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  
  // Design
  const [selectedBg, setSelectedBg] = useState<CardBackground | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🎁');
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
          customEmoji: selectedEmoji || undefined,
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

      // Redirect to payment or success page
      if (data.checkoutUrl) {
        // Mercado Pago checkout - redirect to external payment page
        window.location.href = data.checkoutUrl;
      } else if (data.redirectUrl) {
        // Dev mode - redirect to success page
        router.push(data.redirectUrl);
      } else if (data.giftCardCode) {
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

  // Animation state for card
  const [isCardAnimating, setIsCardAnimating] = useState(false);

  // Trigger animation when background changes
  const handleBgChange = (bg: CardBackground) => {
    setIsCardAnimating(true);
    setTimeout(() => {
      setSelectedBg(bg);
      setIsCardAnimating(false);
    }, 150);
  };

  // Tab configuration
  const tabs = [
    { id: 'design' as const, label: 'Design', icon: Palette },
    { id: 'amount' as const, label: 'Valor', icon: CreditCard },
    { id: 'recipient' as const, label: 'Enviar', icon: Send },
  ];

  return (
    <div className="relative">
      {/* Dynamic background glow effect */}
      <div 
        className="fixed inset-0 transition-all duration-1000 opacity-15 pointer-events-none"
        style={getBgStyle(selectedBg)}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-white via-white/90 to-white pointer-events-none" />
      
      <div className="relative flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Card Preview - ON TOP for mobile */}
        <div className="order-1 lg:order-1">
          <div className="lg:sticky lg:top-24">
            {/* Card Preview with glow */}
            <div className="relative max-w-md mx-auto lg:max-w-none">
              {/* Glow effect behind card */}
              <div 
                className="absolute inset-4 blur-3xl opacity-50 transition-all duration-700"
                style={getBgStyle(selectedBg)}
              />
              
              <GiftCardPreview
                title={customTitle || undefined}
                emoji={selectedEmoji}
                amount={actualAmount}
                businessName={businessName}
                recipientName={recipientName || undefined}
                message={message || undefined}
                senderName={userName || undefined}
                bgType={selectedBg?.type as 'color' | 'gradient' | 'image'}
                bgColor={selectedBg?.color || defaultCardColor}
                bgGradientStart={selectedBg?.gradient_start || undefined}
                bgGradientEnd={selectedBg?.gradient_end || undefined}
                bgGradientDirection={selectedBg?.gradient_direction || undefined}
                bgImageUrl={selectedBg?.image_url || undefined}
                textColor={textColor}
                size="lg"
                showMessage={!!message}
                isAnimating={isCardAnimating}
              />
            </div>
          </div>
        </div>

        {/* Builder Form - Tabbed interface */}
        <div className="order-2 lg:order-2">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 mb-4 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Personalize o Design</h3>
                  <p className="text-sm text-slate-500">Escolha as cores e adicione seu toque pessoal</p>
                </div>

                {/* Background selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Cor de fundo</label>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {allBackgrounds.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => handleBgChange(bg)}
                        className={`aspect-square rounded-xl overflow-hidden relative transition-all ${
                          selectedBg?.id === bg.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                        }`}
                        style={getBgStyle(bg)}
                        title={bg.name}
                      >
                        {selectedBg?.id === bg.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Emoji do cartão</label>
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                    {GIFT_CARD_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`aspect-square rounded-lg text-xl sm:text-2xl flex items-center justify-center transition-all ${
                          selectedEmoji === emoji
                            ? 'bg-slate-100 ring-2 ring-slate-900 scale-110'
                            : 'hover:bg-slate-50 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título do cartão
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Feliz Aniversário!"
                    maxLength={50}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-lg text-slate-900 placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">Deixe em branco para usar &quot;Vale-Presente&quot;</p>
                </div>

                {/* Next button */}
                <button
                  onClick={() => setActiveTab('amount')}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Próximo: Valor
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Amount Tab */}
            {activeTab === 'amount' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Escolha o Valor</h3>
                  <p className="text-sm text-slate-500">Selecione um valor ou digite o seu</p>
                </div>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-2">
                  {settings.presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setUseCustomAmount(false);
                      }}
                      className={`py-4 px-3 rounded-xl font-semibold transition-all text-base ${
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

                {/* Custom amount - inline input style */}
                {settings.allowCustomAmount && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setUseCustomAmount(true);
                        // Focus the input after a short delay
                        setTimeout(() => {
                          const input = document.getElementById('custom-amount-input');
                          if (input) input.focus();
                        }, 50);
                      }}
                      className={`w-full py-4 px-4 rounded-xl font-semibold transition-all text-base flex items-center justify-center gap-2 ${
                        useCustomAmount
                          ? 'bg-white ring-2 ring-slate-300 text-slate-900'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {useCustomAmount ? (
                        <div className="flex items-center gap-2 w-full">
                          <DollarSign className="w-5 h-5 flex-shrink-0 text-slate-500" />
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-slate-500">R$</span>
                            <input
                              id="custom-amount-input"
                              type="number"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Digite o valor"
                              min={settings.minAmount / 100}
                              max={settings.maxAmount / 100}
                              step="0.01"
                              className="bg-transparent border-none outline-none text-xl font-bold text-slate-900 placeholder:text-slate-400 w-full text-center [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUseCustomAmount(false);
                              setCustomAmount('');
                            }}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Outro valor
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Mín: {formatCurrency(settings.minAmount)} • Máx: {formatCurrency(settings.maxAmount)}
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('design')}
                    className="flex-1 py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setActiveTab('recipient')}
                    className="flex-1 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Próximo
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Recipient Tab */}
            {activeTab === 'recipient' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Enviar para</h3>
                  <p className="text-sm text-slate-500">Preencha os dados do destinatário</p>
                </div>

                {/* Recipient name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome do destinatário
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Para quem é o presente?"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Recipient email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email do destinatário
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva uma mensagem especial..."
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-slate-900 placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">{message.length}/500</p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Total and Checkout */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600">Total:</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(actualAmount)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('amount')}
                      className="py-3 px-4 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Voltar
                    </button>
                    
                    {isAuthenticated ? (
                      <button
                        onClick={handleCheckout}
                        disabled={isLoading || actualAmount < settings.minAmount || !recipientName || !recipientEmail}
                        className="flex-1 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Gift className="w-5 h-5" />
                            Finalizar Compra
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={`/auth/login?redirect=${encodeURIComponent(returnUrl)}`}
                        className="flex-1 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 hover:opacity-90"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        <LogIn className="w-5 h-5" />
                        Entrar para Continuar
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 text-center mt-3">
                    Pagamento seguro
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

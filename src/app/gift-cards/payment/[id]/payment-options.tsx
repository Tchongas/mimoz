'use client';

// ============================================
// MIMOZ - Payment Options Component
// ============================================
// Allows user to choose between PIX and Card payment

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, QrCode, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface PaymentOptionsProps {
  giftCardId: string;
  giftCardCode: string;
  businessSlug: string;
  amount: number;
  accentColor: string;
}

type PaymentMethod = 'PIX' | 'CARD';

interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  paymentUrl?: string;
}

export function PaymentOptions({ 
  giftCardId, 
  giftCardCode,
  businessSlug, 
  amount, 
  accentColor 
}: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX');
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePayment = async () => {
    setPaymentState({ status: 'processing' });

    startTransition(async () => {
      try {
        const response = await fetch('/api/gift-cards/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            giftCardId,
            paymentMethod: selectedMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setPaymentState({ 
            status: 'error', 
            message: data.error || 'Erro ao processar pagamento' 
          });
          return;
        }

        if (data.paymentUrl) {
          // Redirect to external payment page (AbacatePay)
          setPaymentState({ status: 'success', message: 'Redirecionando...' });
          window.location.href = data.paymentUrl;
        } else if (data.devMode) {
          // Dev mode - card is activated directly
          setPaymentState({ status: 'success', message: 'Pagamento simulado!' });
          setTimeout(() => {
            router.push(`/gift-cards/success/${giftCardId}`);
          }, 1000);
        } else {
          setPaymentState({ 
            status: 'error', 
            message: 'Resposta inesperada do servidor' 
          });
        }
      } catch (error) {
        console.error('Payment error:', error);
        setPaymentState({ 
          status: 'error', 
          message: 'Erro de conexão. Tente novamente.' 
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-4">
        {/* PIX Option */}
        <button
          type="button"
          onClick={() => setSelectedMethod('PIX')}
          disabled={paymentState.status === 'processing'}
          className={`relative p-4 rounded-xl border-2 transition-all text-left ${
            selectedMethod === 'PIX'
              ? 'border-green-500 bg-green-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          } ${paymentState.status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedMethod === 'PIX' && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${
              selectedMethod === 'PIX' ? 'bg-green-100' : 'bg-slate-100'
            }`}>
              <QrCode className={`w-6 h-6 ${
                selectedMethod === 'PIX' ? 'text-green-600' : 'text-slate-600'
              }`} />
            </div>
            <span className="font-semibold text-slate-900">PIX</span>
          </div>
          <p className="text-sm text-slate-600">
            Pagamento instantâneo via QR Code
          </p>
          <p className="text-xs text-green-600 mt-2 font-medium">
            Aprovação imediata
          </p>
        </button>

        {/* Card Option */}
        <button
          type="button"
          onClick={() => setSelectedMethod('CARD')}
          disabled={paymentState.status === 'processing'}
          className={`relative p-4 rounded-xl border-2 transition-all text-left ${
            selectedMethod === 'CARD'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          } ${paymentState.status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedMethod === 'CARD' && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${
              selectedMethod === 'CARD' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <CreditCard className={`w-6 h-6 ${
                selectedMethod === 'CARD' ? 'text-blue-600' : 'text-slate-600'
              }`} />
            </div>
            <span className="font-semibold text-slate-900">Cartão</span>
          </div>
          <p className="text-sm text-slate-600">
            Crédito ou débito
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Parcele em até 12x
          </p>
        </button>
      </div>

      {/* Error Message */}
      {paymentState.status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{paymentState.message}</p>
        </div>
      )}

      {/* Success Message */}
      {paymentState.status === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm">{paymentState.message}</p>
        </div>
      )}

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={isPending || paymentState.status === 'processing' || paymentState.status === 'success'}
        className="w-full py-4 text-lg font-semibold"
        style={{ backgroundColor: accentColor }}
      >
        {isPending || paymentState.status === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : paymentState.status === 'success' ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            {paymentState.message}
          </>
        ) : (
          <>
            Pagar {formatCurrency(amount)} com {selectedMethod === 'PIX' ? 'PIX' : 'Cartão'}
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-slate-500 text-center">
        Ao continuar, você concorda com os{' '}
        <a href="/terms" className="underline hover:text-slate-700">
          termos de uso
        </a>{' '}
        e{' '}
        <a href="/privacy" className="underline hover:text-slate-700">
          política de privacidade
        </a>
        .
      </p>
    </div>
  );
}

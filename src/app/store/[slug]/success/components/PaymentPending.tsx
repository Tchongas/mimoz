'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentPendingProps {
  giftCardId: string;
  giftCardCode: string;
}

export function PaymentPending({ giftCardId, giftCardCode }: PaymentPendingProps) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);
  const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds max wait

  useEffect(() => {
    if (attempts >= maxAttempts) {
      setError(true);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/gift-cards/${giftCardId}/status`);
        const data = await response.json();
        
        if (data.status === 'ACTIVE') {
          // Payment confirmed! Refresh the page to show the gift card
          router.refresh();
        } else {
          // Still pending, try again
          setAttempts(prev => prev + 1);
        }
      } catch (err) {
        console.error('Error checking status:', err);
        setAttempts(prev => prev + 1);
      }
    };

    const timer = setTimeout(checkStatus, 3000);
    return () => clearTimeout(timer);
  }, [attempts, giftCardId, router, maxAttempts]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pagamento não confirmado</h2>
        <p className="text-slate-600 mb-6">
          Não conseguimos confirmar seu pagamento. Se você completou o pagamento, 
          aguarde alguns minutos e verifique sua conta.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setError(false);
              setAttempts(0);
            }}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Tentar novamente
          </button>
          <a
            href="/account"
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Ir para minha conta
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Processando pagamento...</h2>
      <p className="text-slate-600 mb-6">
        Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns segundos.
      </p>

      <p className="text-sm text-slate-500">
        Verificando... ({attempts}/{maxAttempts})
      </p>

      <p className="text-xs text-slate-400 mt-2">
        Código do vale: <span className="font-mono">{giftCardCode}</span>
      </p>
    </div>
  );
}

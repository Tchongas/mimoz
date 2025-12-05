'use client';

// ============================================
// MIMOZ - Validate Code Form Component
// ============================================
// Form to enter gift card code and view details

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  CreditCard,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ValidateCodeResponse } from '@/types';

interface ValidateCodeFormProps {
  businessId: string;
}

type CardStatus = 'idle' | 'loading' | 'found' | 'error';

interface CardInfo {
  id: string;
  code: string;
  status: string;
  paymentStatus?: string;
  amountCents: number;
  originalAmountCents?: number;
  balanceCents: number;
  recipientName: string | null;
  recipientEmail: string | null;
  purchaserName: string | null;
  expiresAt: string;
}

export function ValidateCodeForm({ businessId }: ValidateCodeFormProps) {
  const [code, setCode] = useState('');
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setErrorMessage('Digite um código');
      return;
    }

    setCardStatus('loading');
    setErrorMessage(null);
    setCardInfo(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/codes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim().toUpperCase(), businessId }),
        });

        const data: ValidateCodeResponse = await response.json();

        if (!response.ok || !data.valid) {
          setCardStatus('error');
          setErrorMessage(data.error || 'Código não encontrado');
          return;
        }

        if (data.giftCard) {
          setCardInfo({
            id: data.giftCard.id,
            code: data.giftCard.code,
            status: data.giftCard.status,
            paymentStatus: data.giftCard.payment_status,
            amountCents: data.giftCard.amount_cents,
            originalAmountCents: data.giftCard.original_amount_cents,
            balanceCents: data.giftCard.balance_cents,
            recipientName: data.giftCard.recipient_name,
            recipientEmail: data.giftCard.recipient_email,
            purchaserName: data.giftCard.purchaser_name,
            expiresAt: data.giftCard.expires_at,
          });
          setCardStatus('found');
        }
      } catch {
        setCardStatus('error');
        setErrorMessage('Erro de conexão. Tente novamente.');
      }
    });
  };

  const handleRedeem = () => {
    if (cardInfo) {
      router.push(`/cashier/redeem/${cardInfo.id}`);
    }
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    // Check payment status first
    if (paymentStatus === 'PENDING' || status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Pagamento Pendente
        </span>
      );
    }

    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Ativo
          </span>
        );
      case 'REDEEMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Totalmente Utilizado
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Expirado
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const canRedeem = cardInfo && 
    cardInfo.status === 'ACTIVE' && 
    cardInfo.balanceCents > 0 &&
    new Date(cardInfo.expiresAt) > new Date();

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Digite o código (ex: MIMO-XXXX-XXXX)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (cardStatus !== 'idle') {
                setCardStatus('idle');
                setCardInfo(null);
                setErrorMessage(null);
              }
            }}
            className="text-lg font-mono uppercase"
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending || !code.trim()}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </>
          )}
        </Button>
      </form>

      {/* Error Message */}
      {cardStatus === 'error' && errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">{errorMessage}</p>
            <p className="text-sm text-red-600 mt-1">
              Verifique o código e tente novamente
            </p>
          </div>
        </div>
      )}

      {/* Card Found */}
      {cardStatus === 'found' && cardInfo && (
        <div className="space-y-4">
          {/* Card Info */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Código</p>
                  <p className="text-xl font-mono font-bold text-slate-900">{cardInfo.code}</p>
                </div>
                {getStatusBadge(cardInfo.status, cardInfo.paymentStatus)}
              </div>
            </div>

            {/* Balance */}
            <div className="px-6 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Saldo Disponível</p>
                  <p className="text-4xl font-bold text-green-600">
                    {formatCurrency(cardInfo.balanceCents)}
                  </p>
                </div>
                {cardInfo.originalAmountCents && cardInfo.originalAmountCents !== cardInfo.balanceCents && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Valor Original</p>
                    <p className="text-lg text-slate-600">
                      {formatCurrency(cardInfo.originalAmountCents)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Titular</p>
                  <p className="font-medium text-slate-900">
                    {cardInfo.recipientName || cardInfo.purchaserName || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Válido até</p>
                  <p className="font-medium text-slate-900">
                    {new Date(cardInfo.expiresAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Messages */}
            {cardInfo.status === 'PENDING' && (
              <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-700">
                    Este vale-presente ainda não foi pago. Não é possível resgatar.
                  </p>
                </div>
              </div>
            )}

            {cardInfo.status === 'REDEEMED' && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  <p className="text-slate-700">
                    Este vale-presente já foi totalmente utilizado.
                  </p>
                </div>
              </div>
            )}

            {cardInfo.status === 'EXPIRED' && (
              <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700">
                    Este vale-presente expirou e não pode mais ser utilizado.
                  </p>
                </div>
              </div>
            )}

            {/* Action */}
            {canRedeem && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <Button 
                  onClick={handleRedeem}
                  className="w-full py-3 text-lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Resgatar Créditos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {cardStatus === 'idle' && (
        <div className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
          <p className="font-medium text-slate-700 mb-2">Instruções:</p>
          <ul className="space-y-1">
            <li>• Digite o código exatamente como aparece no vale-presente</li>
            <li>• O código será convertido automaticamente para maiúsculas</li>
            <li>• Após validar, você poderá resgatar o valor desejado</li>
          </ul>
        </div>
      )}
    </div>
  );
}

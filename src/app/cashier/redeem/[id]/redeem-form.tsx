'use client';

// ============================================
// MIMOZ - Redeem Form Component
// ============================================
// Form to redeem credits from a gift card

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Percent
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RedeemFormProps {
  giftCardId: string;
  giftCardCode: string;
  businessId: string;
  maxAmount: number;
  recipientName: string | null;
}

type RedeemStatus = 'idle' | 'processing' | 'success' | 'error';

interface RedeemResult {
  amountCents: number;
  balanceBefore: number;
  balanceAfter: number;
  newStatus: string;
}

export function RedeemForm({ 
  giftCardId, 
  giftCardCode,
  businessId, 
  maxAmount,
  recipientName 
}: RedeemFormProps) {
  const [amountInput, setAmountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<RedeemStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Parse amount from input (handles both "50" and "50,00" formats)
  const parseAmount = (input: string): number => {
    const cleaned = input.replace(/[^\d,\.]/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : Math.round(value * 100);
  };

  const amountCents = parseAmount(amountInput);
  const isValidAmount = amountCents > 0 && amountCents <= maxAmount;

  const handleQuickAmount = (cents: number) => {
    const value = (cents / 100).toFixed(2).replace('.', ',');
    setAmountInput(value);
  };

  const handleFullAmount = () => {
    handleQuickAmount(maxAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidAmount) {
      setErrorMessage('Digite um valor válido');
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/codes/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            giftCardId,
            amountCents,
            businessId,
            notes: notes.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setErrorMessage(data.error || 'Erro ao resgatar');
          return;
        }

        setResult({
          amountCents: data.redemption.amount_cents,
          balanceBefore: data.redemption.balance_before,
          balanceAfter: data.redemption.balance_after,
          newStatus: data.redemption.new_status,
        });
        setStatus('success');

      } catch {
        setStatus('error');
        setErrorMessage('Erro de conexão. Tente novamente.');
      }
    });
  };

  const handleNewRedemption = () => {
    router.push('/cashier/validate');
  };

  // Success state
  if (status === 'success' && result) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Resgate Realizado!
          </h3>
          <p className="text-slate-600">
            {result.newStatus === 'REDEEMED' 
              ? 'Vale-presente totalmente utilizado'
              : 'Créditos resgatados com sucesso'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Código</span>
            <span className="font-mono font-medium text-slate-900">{giftCardCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Valor Resgatado</span>
            <span className="font-bold text-green-600">
              {formatCurrency(result.amountCents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Saldo Anterior</span>
            <span className="text-slate-900">{formatCurrency(result.balanceBefore)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-600">Novo Saldo</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(result.balanceAfter)}
            </span>
          </div>
        </div>

        <Button onClick={handleNewRedemption} className="w-full">
          Validar Outro Código
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount" required>Valor a Resgatar</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
            R$
          </span>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setErrorMessage(null);
            }}
            className="pl-12 text-2xl font-bold text-right"
            disabled={isPending}
          />
        </div>
        <p className="text-sm text-slate-500">
          Máximo disponível: {formatCurrency(maxAmount)}
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="space-y-2">
        <Label>Valores Rápidos</Label>
        <div className="grid grid-cols-4 gap-2">
          {[1000, 2000, 5000, 10000].map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => handleQuickAmount(Math.min(cents, maxAmount))}
              disabled={isPending || cents > maxAmount}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formatCurrency(cents)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleFullAmount}
          disabled={isPending}
          className="w-full py-2 px-3 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium text-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Percent className="w-4 h-4" />
          Usar Saldo Total ({formatCurrency(maxAmount)})
        </button>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Ex: Compra de produtos, número do pedido..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          disabled={isPending}
        />
      </div>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Confirmation */}
      {isValidAmount && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Confirmar resgate:</strong> {formatCurrency(amountCents)} do vale-presente 
            {recipientName ? ` de ${recipientName}` : ''}.
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Saldo restante: {formatCurrency(maxAmount - amountCents)}
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending || !isValidAmount}
        className="w-full py-3 text-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <DollarSign className="w-5 h-5 mr-2" />
            Confirmar Resgate
          </>
        )}
      </Button>
    </form>
  );
}

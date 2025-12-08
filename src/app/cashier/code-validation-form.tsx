'use client';

// ============================================
// MIMOZ - Code Validation Form Component
// ============================================
// Validates gift card code and allows redemption

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Search,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CodeValidationFormProps {
  businessId: string;
}

interface GiftCardInfo {
  id: string;
  code: string;
  status: string;
  amountCents: number;
  originalAmountCents: number;
  balanceCents: number;
  recipientName: string | null;
  recipientEmail: string | null;
  purchaserName: string | null;
  expiresAt: string;
}

type ViewState = 'search' | 'found' | 'redeem' | 'success' | 'error';

export function CodeValidationForm({ businessId }: CodeValidationFormProps) {
  const [code, setCode] = useState('');
  const [viewState, setViewState] = useState<ViewState>('search');
  const [giftCard, setGiftCard] = useState<GiftCardInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Redemption state
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [redemptionResult, setRedemptionResult] = useState<{
    amountCents: number;
    balanceAfter: number;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setErrorMessage('Digite um código');
      return;
    }

    setViewState('search');
    setErrorMessage(null);
    setGiftCard(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/codes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim().toUpperCase(), businessId }),
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          setViewState('error');
          setErrorMessage(data.error || 'Código não encontrado');
          return;
        }

        if (data.giftCard) {
          setGiftCard({
            id: data.giftCard.id,
            code: data.giftCard.code,
            status: data.giftCard.status,
            amountCents: data.giftCard.amount_cents,
            originalAmountCents: data.giftCard.original_amount_cents || data.giftCard.amount_cents,
            balanceCents: data.giftCard.balance_cents,
            recipientName: data.giftCard.recipient_name,
            recipientEmail: data.giftCard.recipient_email,
            purchaserName: data.giftCard.purchaser_name,
            expiresAt: data.giftCard.expires_at,
          });
          setViewState('found');
        }
      } catch {
        setViewState('error');
        setErrorMessage('Erro de conexão. Tente novamente.');
      }
    });
  };

  const parseAmount = (input: string): number => {
    const cleaned = input.replace(/[^\d,\.]/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : Math.round(value * 100);
  };

  const amountCents = parseAmount(redeemAmount);
  const isValidAmount = giftCard && amountCents > 0 && amountCents <= giftCard.balanceCents;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!giftCard || !isValidAmount) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/codes/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            giftCardId: giftCard.id,
            amountCents,
            businessId,
            notes: redeemNotes.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error || 'Erro ao resgatar');
          return;
        }

        setRedemptionResult({
          amountCents: data.redemption.amount_cents,
          balanceAfter: data.redemption.balance_after,
        });
        setViewState('success');
        router.refresh();
      } catch {
        setErrorMessage('Erro de conexão. Tente novamente.');
      }
    });
  };

  const handleQuickAmount = (cents: number) => {
    const value = (cents / 100).toFixed(2).replace('.', ',');
    setRedeemAmount(value);
  };

  const handleReset = () => {
    setCode('');
    setViewState('search');
    setGiftCard(null);
    setErrorMessage(null);
    setRedeemAmount('');
    setRedeemNotes('');
    setRedemptionResult(null);
  };

  const isExpired = giftCard && new Date(giftCard.expiresAt) < new Date();
  const canRedeem = giftCard && 
    giftCard.status === 'ACTIVE' && 
    giftCard.balanceCents > 0 && 
    !isExpired;

  // SUCCESS VIEW
  if (viewState === 'success' && redemptionResult) {
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
            {redemptionResult.balanceAfter === 0 
              ? 'Vale-presente totalmente utilizado'
              : 'Créditos descontados com sucesso'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Código</span>
            <span className="font-mono font-medium text-slate-900">{giftCard?.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Valor Descontado</span>
            <span className="font-bold text-green-600">
              - {formatCurrency(redemptionResult.amountCents)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-600">Saldo Restante</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(redemptionResult.balanceAfter)}
            </span>
          </div>
        </div>

        <Button onClick={handleReset} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Validar Outro Código
        </Button>
      </div>
    );
  }

  // FOUND VIEW - Show gift card details and redemption form
  if (viewState === 'found' && giftCard) {
    return (
      <div className="space-y-6">
        {/* Gift Card Info */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono font-bold text-slate-900">{giftCard.code}</code>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                giftCard.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                giftCard.status === 'REDEEMED' ? 'bg-slate-100 text-slate-700' :
                'bg-red-100 text-red-700'
              }`}>
                {giftCard.status === 'ACTIVE' ? 'Ativo' : 
                 giftCard.status === 'REDEEMED' ? 'Usado' : 'Expirado'}
              </span>
            </div>
          </div>

          {/* Balance */}
          <div className="px-4 py-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <p className="text-sm text-slate-600">Saldo Disponível</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(giftCard.balanceCents)}
            </p>
            {giftCard.originalAmountCents !== giftCard.balanceCents && (
              <p className="text-xs text-slate-500 mt-1">
                Valor original: {formatCurrency(giftCard.originalAmountCents)}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="px-4 py-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">Titular:</span>
              <span className="font-medium text-slate-900">
                {giftCard.recipientName || giftCard.purchaserName || 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">Válido até:</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                {new Date(giftCard.expiresAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {isExpired && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">Este vale-presente expirou e não pode ser utilizado.</p>
          </div>
        )}

        {giftCard.status === 'REDEEMED' && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <p className="text-slate-700">Este vale-presente já foi totalmente utilizado.</p>
          </div>
        )}

        {/* Redemption Form */}
        {canRedeem && (
          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor a Descontar</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                  R$
                </span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="pl-12 text-xl font-bold text-right"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2">
              {[1000, 2000, 5000].map((cents) => (
                <button
                  key={cents}
                  type="button"
                  onClick={() => handleQuickAmount(Math.min(cents, giftCard.balanceCents))}
                  disabled={isPending || cents > giftCard.balanceCents}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50"
                >
                  {formatCurrency(cents)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickAmount(giftCard.balanceCents)}
                disabled={isPending}
                className="px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium text-green-700"
              >
                Tudo ({formatCurrency(giftCard.balanceCents)})
              </button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Ex: Pedido #123"
                value={redeemNotes}
                onChange={(e) => setRedeemNotes(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Confirm */}
            {isValidAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Confirmar:</strong> Descontar {formatCurrency(amountCents)} do vale-presente.
                  Saldo restante: {formatCurrency(giftCard.balanceCents - amountCents)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !isValidAmount}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Confirmar Desconto
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Back button if can't redeem */}
        {!canRedeem && (
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Validar Outro Código
          </Button>
        )}
      </div>
    );
  }

  // SEARCH VIEW (default)
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Digite o código (ex: MIMO-XXXX-XXXX)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setErrorMessage(null);
              setViewState('search');
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
      {viewState === 'error' && errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">{errorMessage}</p>
            <p className="text-sm text-red-600 mt-1">Verifique o código e tente novamente</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {viewState === 'search' && !errorMessage && (
        <div className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
          <p className="font-medium text-slate-700 mb-2">Instruções:</p>
          <ul className="space-y-1">
            <li>• Digite o código exatamente como aparece no vale-presente</li>
            <li>• Após validar, você poderá descontar o valor da compra</li>
            <li>• O saldo restante fica disponível para uso futuro</li>
          </ul>
        </div>
      )}
    </div>
  );
}

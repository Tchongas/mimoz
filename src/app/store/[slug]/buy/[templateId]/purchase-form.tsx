'use client';

// ============================================
// MIMOZ - Purchase Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { User, Mail, MessageSquare, CreditCard } from 'lucide-react';

interface PurchaseFormProps {
  businessId: string | number;
  businessSlug: string;
  templateId: string;
  amount: number;
  accentColor?: string;
}

export function PurchaseForm({ businessId, businessSlug, templateId, amount, accentColor = '#2563eb' }: PurchaseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Purchaser info
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');

  // Recipient info
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientMessage, setRecipientMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          templateId,
          purchaserName,
          purchaserEmail,
          recipientName: isGift ? recipientName : purchaserName,
          recipientEmail: isGift ? recipientEmail : purchaserEmail,
          recipientMessage: isGift ? recipientMessage : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar compra');
      }

      // Redirect to payment page or success page
      if (data.checkoutUrl) {
        // AbacatePay payment link - redirect to payment
        window.location.href = data.checkoutUrl;
      } else if (data.giftCardCode) {
        // Dev mode without payment - redirect to success directly
        router.push(`/store/${businessSlug}/success?code=${data.giftCardCode}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Purchaser Info */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4" />
          Seus dados
        </h3>

        <div className="space-y-2">
          <Label htmlFor="purchaserName" required>Seu nome</Label>
          <Input
            id="purchaserName"
            value={purchaserName}
            onChange={(e) => setPurchaserName(e.target.value)}
            placeholder="João Silva"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaserEmail" required>Seu email</Label>
          <Input
            id="purchaserEmail"
            type="email"
            value={purchaserEmail}
            onChange={(e) => setPurchaserEmail(e.target.value)}
            placeholder="joao@email.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Gift Toggle */}
      <div className="border-t border-slate-200 pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isGift}
            onChange={(e) => setIsGift(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            disabled={isLoading}
          />
          <span className="font-medium text-slate-900">
            Enviar como presente para outra pessoa
          </span>
        </label>
      </div>

      {/* Recipient Info (if gift) */}
      {isGift && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
          <h3 className="font-medium text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Dados do presenteado
          </h3>

          <div className="space-y-2">
            <Label htmlFor="recipientName" required>Nome do presenteado</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Maria Santos"
              required={isGift}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientEmail" required>Email do presenteado</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="maria@email.com"
              required={isGift}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientMessage">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Mensagem personalizada (opcional)
              </span>
            </Label>
            <textarea
              id="recipientMessage"
              value={recipientMessage}
              onChange={(e) => setRecipientMessage(e.target.value)}
              placeholder="Feliz aniversário! Espero que aproveite..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-600">Vale-Presente</span>
          <span className="font-medium text-slate-900">{formatCurrency(amount)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span className="text-slate-900">Total</span>
          <span className="text-slate-900">{formatCurrency(amount)}</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-lg text-white font-medium text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pagar {formatCurrency(amount)}
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 text-center">
        Pagamento seguro via PIX
      </p>
    </form>
  );
}

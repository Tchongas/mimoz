'use client';

// ============================================
// MIMOZ - Admin Gift Card Template Form
// ============================================
// Form for creating/editing gift card templates from admin panel

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner, Card, CardContent } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface AdminTemplateFormProps {
  businessId: string;
  businessGiftCardColor?: string | null;
  returnUrl: string;
  template?: {
    id: string;
    name: string;
    description: string | null;
    amount_cents: number;
    valid_days: number;
    is_active: boolean;
    card_color: string | null;
  };
}

const DEFAULT_CARD_COLOR = '#1e3a5f';

export function AdminTemplateForm({ businessId, businessGiftCardColor, returnUrl, template }: AdminTemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [amountCents, setAmountCents] = useState(template?.amount_cents || 5000);
  const [customAmount, setCustomAmount] = useState('');
  const [validDays, setValidDays] = useState(template?.valid_days || 365);
  const [isActive, setIsActive] = useState(template?.is_active ?? true);
  const [useCustomColor, setUseCustomColor] = useState(!!template?.card_color);
  const [cardColor, setCardColor] = useState(template?.card_color || businessGiftCardColor || DEFAULT_CARD_COLOR);

  const handleAmountChange = (value: string) => {
    const cents = Math.round(parseFloat(value) * 100);
    if (!isNaN(cents) && cents > 0) {
      setAmountCents(cents);
      setCustomAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = template 
        ? `/api/business/templates/${template.id}`
        : '/api/business/templates';
      
      const response = await fetch(url, {
        method: template ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          name,
          description: description || null,
          amountCents,
          validDays,
          isActive,
          cardColor: useCustomColor ? cardColor : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar modelo');
      }

      router.push(returnUrl);
      router.refresh();
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

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>Nome do modelo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vale-Presente R$50"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o vale-presente..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label required>Valor</Label>
            <div className="grid grid-cols-4 gap-2">
              {[2500, 5000, 10000, 15000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setAmountCents(amount);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    amountCents === amount && !customAmount
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                  disabled={isLoading}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[20000, 25000, 50000, 100000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setAmountCents(amount);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    amountCents === amount && !customAmount
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                  disabled={isLoading}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">ou</span>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Valor personalizado"
                  className="pl-10"
                  min="1"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Valor selecionado: <span className="font-medium text-slate-900">{formatCurrency(amountCents)}</span>
            </p>
          </div>

          {/* Valid Days */}
          <div className="space-y-2">
            <Label htmlFor="validDays" required>Validade (dias)</Label>
            <Input
              id="validDays"
              type="number"
              value={validDays}
              onChange={(e) => setValidDays(parseInt(e.target.value) || 365)}
              min="1"
              max="3650"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-slate-500">
              O vale-presente expira {validDays} dias após a compra
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Disponível para venda</p>
              <p className="text-sm text-slate-500">
                {isActive ? 'Visível na loja' : 'Oculto da loja'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          {/* Custom Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Cor personalizada</p>
                <p className="text-sm text-slate-500">
                  {useCustomColor ? 'Usando cor própria' : 'Usando cor padrão da empresa'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomColor}
                  onChange={(e) => setUseCustomColor(e.target.checked)}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
            
            {useCustomColor && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input
                  type="color"
                  value={cardColor}
                  onChange={(e) => setCardColor(e.target.value)}
                  disabled={isLoading}
                  className="w-12 h-12 rounded border border-slate-300 cursor-pointer"
                />
                <div className="flex-1">
                  <Input
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    placeholder="#1e3a5f"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-slate-500 mb-4">Pré-visualização</p>
          <div 
            className="rounded-xl p-6 text-white max-w-sm relative overflow-hidden"
            style={{ backgroundColor: useCustomColor ? cardColor : (businessGiftCardColor || DEFAULT_CARD_COLOR) }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <p className="text-white/60 text-xs relative">Vale-Presente</p>
            <p className="text-3xl font-bold mt-2 relative">{formatCurrency(amountCents)}</p>
            <p className="text-white/60 text-sm mt-4 relative">{name || 'Nome do modelo'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : template ? 'Salvar Alterações' : 'Criar Modelo'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

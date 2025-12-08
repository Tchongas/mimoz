'use client';

// ============================================
// MIMOZ - Business Settings Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner } from '@/components/ui';
import type { Business } from '@/types';

// Default colors
const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  giftCard: '#1e3a5f',
};

interface BusinessSettingsFormProps {
  business: Business;
}

export function BusinessSettingsForm({ business }: BusinessSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Basic info
  const [name, setName] = useState(business.name);
  
  // Customization
  const [description, setDescription] = useState(business.description || '');
  const [primaryColor, setPrimaryColor] = useState(business.primary_color || DEFAULT_COLORS.primary);
  const [secondaryColor, setSecondaryColor] = useState(business.secondary_color || DEFAULT_COLORS.secondary);
  const [giftCardColor, setGiftCardColor] = useState(business.gift_card_color || DEFAULT_COLORS.giftCard);
  
  // Contact info
  const [contactEmail, setContactEmail] = useState(business.contact_email || '');
  const [contactPhone, setContactPhone] = useState(business.contact_phone || '');
  const [website, setWebsite] = useState(business.website || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/business/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          description: description || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          gift_card_color: giftCardColor,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          website: website || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }

      setSuccess('Configurações salvas com sucesso!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = 
    name !== business.name ||
    description !== (business.description || '') ||
    primaryColor !== (business.primary_color || DEFAULT_COLORS.primary) ||
    secondaryColor !== (business.secondary_color || DEFAULT_COLORS.secondary) ||
    giftCardColor !== (business.gift_card_color || DEFAULT_COLORS.giftCard) ||
    contactEmail !== (business.contact_email || '') ||
    contactPhone !== (business.contact_phone || '') ||
    website !== (business.website || '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" required>Nome da Empresa</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da sua empresa"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={business.slug}
          disabled
          className="bg-slate-50"
        />
        <p className="text-xs text-slate-500">
          O slug não pode ser alterado. Contate o suporte se necessário.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição da sua empresa para a página da loja..."
          disabled={isLoading}
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Personalização de Cores</h3>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Cor Principal</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              disabled={isLoading}
              className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#1e3a5f"
              disabled={isLoading}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-slate-500">Cabeçalho da loja</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Cor Secundária</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="secondaryColor"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              disabled={isLoading}
              className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
            />
            <Input
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#2563eb"
              disabled={isLoading}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-slate-500">Botões e links</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="giftCardColor">Cor do Vale-Presente</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="giftCardColor"
              value={giftCardColor}
              onChange={(e) => setGiftCardColor(e.target.value)}
              disabled={isLoading}
              className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
            />
            <Input
              value={giftCardColor}
              onChange={(e) => setGiftCardColor(e.target.value)}
              placeholder="#1e3a5f"
              disabled={isLoading}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-slate-500">Cor padrão dos cartões</p>
        </div>
      </div>

      {/* Color Preview */}
      <div className="space-y-2">
        <Label>Pré-visualização</Label>
        <div className="flex items-center gap-4">
          <div 
            className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Cabeçalho
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: secondaryColor }}
          >
            Botão
          </button>
          <div 
            className="w-24 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: giftCardColor }}
          >
            Vale-Presente
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações de Contato</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email de Contato</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contato@empresa.com"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefone</Label>
          <Input
            id="contactPhone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://www.empresa.com"
          disabled={isLoading}
        />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading || !hasChanges}>
          {isLoading && <Spinner size="sm" className="mr-2" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

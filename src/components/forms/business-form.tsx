'use client';

// ============================================
// Tapresente - Business Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner } from '@/components/ui';
import { slugify } from '@/lib/utils';
import type { Business } from '@/types';

interface BusinessFormProps {
  business?: Business;
  mode: 'create' | 'edit';
  showCustomization?: boolean;
}

const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  giftCard: '#1e3a5f',
};

export function BusinessForm({ business, mode, showCustomization = false }: BusinessFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [name, setName] = useState(business?.name || '');
  const [slug, setSlug] = useState(business?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!business);
  
  // Customization fields
  const [description, setDescription] = useState(business?.description || '');
  const [primaryColor, setPrimaryColor] = useState(business?.primary_color || DEFAULT_COLORS.primary);
  const [secondaryColor, setSecondaryColor] = useState(business?.secondary_color || DEFAULT_COLORS.secondary);
  const [giftCardColor, setGiftCardColor] = useState(business?.gift_card_color || DEFAULT_COLORS.giftCard);
  const [contactEmail, setContactEmail] = useState(business?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(business?.contact_phone || '');
  const [website, setWebsite] = useState(business?.website || '');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (autoSlug) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
    setAutoSlug(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = mode === 'create' 
        ? '/api/admin/businesses'
        : `/api/admin/businesses/${business?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const payload: Record<string, unknown> = { name, slug };
      
      if (showCustomization) {
        payload.description = description || null;
        payload.primary_color = primaryColor;
        payload.secondary_color = secondaryColor;
        payload.gift_card_color = giftCardColor;
        payload.contact_email = contactEmail || null;
        payload.contact_phone = contactPhone || null;
        payload.website = website || null;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar empresa');
      }

      setSuccess(mode === 'create' ? 'Empresa criada com sucesso!' : 'Empresa atualizada com sucesso!');
      
      if (mode === 'create') {
        setTimeout(() => {
          router.push('/admin/businesses');
          router.refresh();
        }, 1000);
      } else {
        router.refresh();
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
          onChange={handleNameChange}
          placeholder="Ex: Restaurante do João"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" required>Slug (URL)</Label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">/store/</span>
          <Input
            id="slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="restaurante-do-joao"
            required
            disabled={isLoading}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-slate-500">
          Este será o endereço da loja: /store/{slug || 'slug'}
        </p>
      </div>

      {showCustomization && (
        <>
          {/* Divider */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personalização</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da sua empresa..."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
            />
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
              <p className="text-xs text-slate-500">Fundo do cartão</p>
            </div>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div className="flex items-center gap-4">
              <div 
                className="w-full h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium"
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
          <div className="border-t border-slate-200 pt-6 mt-6">
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
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner size="sm" className="mr-2" />}
          {mode === 'create' ? 'Criar Empresa' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}

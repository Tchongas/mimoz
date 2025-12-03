'use client';

// ============================================
// MIMOZ - Business Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner } from '@/components/ui';
import { slugify } from '@/lib/utils';
import type { Business } from '@/types';

interface BusinessFormProps {
  business?: Business;
  mode: 'create' | 'edit';
}

export function BusinessForm({ business, mode }: BusinessFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [name, setName] = useState(business?.name || '');
  const [slug, setSlug] = useState(business?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!business);

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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
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

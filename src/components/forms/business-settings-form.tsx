'use client';

// ============================================
// MIMOZ - Business Settings Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner } from '@/components/ui';
import type { Business } from '@/types';

interface BusinessSettingsFormProps {
  business: Business;
}

export function BusinessSettingsForm({ business }: BusinessSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [name, setName] = useState(business.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/business/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
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

  const hasChanges = name !== business.name;

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

      <div className="pt-4">
        <Button type="submit" disabled={isLoading || !hasChanges}>
          {isLoading && <Spinner size="sm" className="mr-2" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

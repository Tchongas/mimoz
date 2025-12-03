'use client';

// ============================================
// MIMOZ - User Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Select, Alert, Spinner } from '@/components/ui';
import type { Profile, Business, Role } from '@/types';

interface UserFormProps {
  user: Profile;
  businesses: Business[];
}

const roleOptions: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'BUSINESS_OWNER', label: 'Proprietário' },
  { value: 'CASHIER', label: 'Operador de Caixa' },
];

export function UserForm({ user, businesses }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [role, setRole] = useState<Role>(user.role);
  const [businessId, setBusinessId] = useState<string>(user.business_id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role,
          businessId: businessId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar usuário');
      }

      setSuccess('Usuário atualizado com sucesso!');
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
        <Alert variant="error">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      {/* Read-only fields */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="bg-slate-50"
        />
        <p className="text-xs text-slate-500">O email não pode ser alterado</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={user.full_name || 'Não informado'}
          disabled
          className="bg-slate-50"
        />
      </div>

      {/* Editable fields */}
      <div className="space-y-2">
        <Label htmlFor="role" required>Função</Label>
        <Select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={isLoading}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500">
          {role === 'ADMIN' && 'Administradores têm acesso total ao sistema'}
          {role === 'BUSINESS_OWNER' && 'Proprietários gerenciam sua empresa'}
          {role === 'CASHIER' && 'Operadores apenas validam códigos'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business">Empresa</Label>
        <Select
          id="business"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          disabled={isLoading || role === 'ADMIN'}
        >
          <option value="">Nenhuma empresa</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </Select>
        {role === 'ADMIN' ? (
          <p className="text-xs text-slate-500">Administradores não precisam de empresa</p>
        ) : (
          <p className="text-xs text-slate-500">Selecione a empresa do usuário</p>
        )}
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
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

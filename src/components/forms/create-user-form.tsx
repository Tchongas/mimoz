'use client';

// ============================================
// Tapresente - Create User Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Select, Alert, Spinner } from '@/components/ui';
import type { Role } from '@/types';

interface BusinessOption {
  id: string;
  name: string;
}

interface CreateUserFormProps {
  businesses: BusinessOption[];
}

const roleOptions: { value: Role; label: string; description: string }[] = [
  { value: 'ADMIN', label: 'Administrador', description: 'Acesso total ao sistema' },
  { value: 'BUSINESS_OWNER', label: 'Proprietário', description: 'Gerencia sua empresa' },
  { value: 'CASHIER', label: 'Operador de Caixa', description: 'Apenas valida códigos' },
];

export function CreateUserForm({ businesses }: CreateUserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('CASHIER');
  const [businessId, setBusinessId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName: fullName || null,
          role,
          businessId: businessId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const needsBusiness = role !== 'ADMIN';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" required>Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@exemplo.com"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500">
          O usuário receberá um convite para acessar o sistema
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nome do usuário"
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500">
          Opcional - será atualizado quando o usuário fizer login
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" required>Função</Label>
        <Select
          id="role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role);
            if (e.target.value === 'ADMIN') {
              setBusinessId('');
            }
          }}
          disabled={isLoading}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500">
          {roleOptions.find(r => r.value === role)?.description}
        </p>
      </div>

      {needsBusiness && (
        <div className="space-y-2">
          <Label htmlFor="business" required={needsBusiness}>Empresa</Label>
          <Select
            id="business"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            disabled={isLoading}
            required={needsBusiness}
          >
            <option value="">Selecione uma empresa</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">
            {role === 'BUSINESS_OWNER' 
              ? 'O proprietário terá acesso total a esta empresa'
              : 'O operador poderá validar códigos desta empresa'}
          </p>
        </div>
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
          Criar Usuário
        </Button>
      </div>
    </form>
  );
}

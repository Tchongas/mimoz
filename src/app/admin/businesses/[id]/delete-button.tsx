'use client';

// ============================================
// MIMOZ - Delete Business Button
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert, Spinner } from '@/components/ui';
import { Trash2, X } from 'lucide-react';

interface DeleteBusinessButtonProps {
  businessId: string;
  businessName: string;
}

export function DeleteBusinessButton({ businessId, businessName }: DeleteBusinessButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir empresa');
      }

      router.push('/admin/businesses');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Confirmar Exclusão</h3>
            <button
              onClick={() => setShowConfirm(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <p className="text-slate-600 mb-6">
            Tem certeza que deseja excluir a empresa <strong>{businessName}</strong>? 
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Spinner size="sm" className="mr-2" />}
              Excluir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Excluir
    </Button>
  );
}

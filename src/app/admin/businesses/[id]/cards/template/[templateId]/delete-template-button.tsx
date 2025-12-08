'use client';

// ============================================
// MIMOZ - Delete Template Button
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Spinner } from '@/components/ui';
import { Trash2 } from 'lucide-react';

interface DeleteTemplateButtonProps {
  templateId: string;
  templateName: string;
  returnUrl: string;
}

export function DeleteTemplateButton({ templateId, templateName, returnUrl }: DeleteTemplateButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/business/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir modelo');
      }

      router.push(returnUrl);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir');
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Excluir "{templateName}"?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Spinner size="sm" /> : 'Confirmar'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:bg-red-50 hover:border-red-300"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Excluir
    </Button>
  );
}

'use client';

// ============================================
// MIMOZ - Delete Invite Button Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

interface DeleteInviteButtonProps {
  inviteId: string;
  email: string;
}

export function DeleteInviteButton({ inviteId, email }: DeleteInviteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Cancelar convite?</span>
        <Button
          size="sm"
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Spinner size="sm" /> : 'Sim'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Não
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title={`Cancelar convite para ${email}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

'use client';

// ============================================
// MIMOZ - Code Validation Form Component
// ============================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CodeValidationFormProps {
  businessId: string;
}

type ValidationResult = {
  success: boolean;
  message: string;
} | null;

export function CodeValidationForm({ businessId }: CodeValidationFormProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ValidationResult>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setResult({ success: false, message: 'Digite um código' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/codes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim().toUpperCase(), businessId }),
        });

        const data = await response.json();

        if (response.ok) {
          setResult({ success: true, message: 'Código validado com sucesso!' });
          setCode('');
          router.refresh();
        } else {
          setResult({ success: false, message: data.error || 'Erro ao validar código' });
        }
      } catch {
        setResult({ success: false, message: 'Erro de conexão. Tente novamente.' });
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Digite o código (ex: GIFT-ABC12345)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setResult(null);
            }}
            className="text-lg font-mono uppercase"
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending || !code.trim()}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            'Validar'
          )}
        </Button>
      </form>

      {/* Result Message */}
      {result && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          )}
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-slate-500">
        <p>Instruções:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Digite o código exatamente como aparece no gift card</li>
          <li>O código será convertido automaticamente para maiúsculas</li>
          <li>Após validar, o código será registrado no sistema</li>
        </ul>
      </div>
    </div>
  );
}

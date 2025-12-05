'use client';

// ============================================
// MIMOZ - Copy Code Button Component
// ============================================

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
      title={copied ? 'Copiado!' : 'Copiar código'}
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-300" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
    </button>
  );
}

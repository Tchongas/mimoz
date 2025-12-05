'use client';

// ============================================
// MIMOZ - Share Button Component
// ============================================

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Mail } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ShareButtonProps {
  code: string;
  businessName: string;
  amount: number;
}

export function ShareButton({ code, businessName, amount }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🎁 Você recebeu um vale-presente de ${formatCurrency(amount)} para usar em ${businessName}!\n\nCódigo: ${code}\n\nApresente este código no caixa para usar seu crédito.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleEmail = () => {
    const subject = `Vale-presente ${businessName} - ${formatCurrency(amount)}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
    setShowMenu(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vale-presente ${businessName}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed:', err);
      }
    } else {
      setShowMenu(true);
    }
  };

  return (
    <div className="relative flex-1">
      <button
        onClick={handleNativeShare}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </button>

      {/* Share Menu (fallback for browsers without native share) */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-slate-600" />
              )}
              <span className="text-slate-700">
                {copied ? 'Copiado!' : 'Copiar mensagem'}
              </span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-100"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-slate-700">WhatsApp</span>
            </button>
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-100"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-slate-700">Email</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

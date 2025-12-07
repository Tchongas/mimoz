import { CheckCircle } from 'lucide-react';

interface CelebrationBannerProps {
  isGift: boolean;
  recipientName: string | null;
}

export function CelebrationBanner({ isGift, recipientName }: CelebrationBannerProps) {
  return (
    <div className="text-center mb-8">
      {/* Small confetti burst */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-green-100 animate-ping opacity-60" />
        <div className="absolute w-16 h-16 rounded-full bg-emerald-200 opacity-70" />
        <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Pagamento confirmado</span>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        {isGift ? '🎁 Presente enviado!' : '🎉 Vale-presente criado!'}
      </h2>
      <p className="text-slate-500 text-sm sm:text-base">
        {isGift
          ? `${recipientName || 'O destinatário'} receberá um email com o código.`
          : 'Guarde o código abaixo para usar na loja.'}
      </p>
    </div>
  );
}
